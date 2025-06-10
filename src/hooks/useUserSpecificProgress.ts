
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  category: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  is_optional: boolean;
  completed: boolean;
  accessible: boolean;
}

interface UserSpecificProgressData {
  steps: JourneyStep[];
  completionPercentage: number;
  nextStep?: JourneyStep;
  loading: boolean;
}

const isValidCategory = (category: string): category is 'foundation' | 'scheduling' | 'trial' | 'conversion' => {
  return ['foundation', 'scheduling', 'trial', 'conversion'].includes(category);
};

export const useUserSpecificProgress = (userId: string, userRole: string): UserSpecificProgressData => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>([]);

  useEffect(() => {
    if (!userId || !userRole) {
      console.log('useUserSpecificProgress: Missing userId or userRole', { userId, userRole });
      return;
    }
    
    const fetchUserProgress = async () => {
      try {
        setLoading(true);
        console.log('🔍 useUserSpecificProgress: Starting fetch for', { userId, userRole });
        
        // Fetch journey steps for the user role
        const { data: journeySteps, error: stepsError } = await supabase
          .from('journey_steps')
          .select('*')
          .eq('user_role', userRole)
          .eq('is_active', true)
          .order('order_index');

        if (stepsError) {
          console.error('❌ Error fetching journey steps:', stepsError);
          throw stepsError;
        }

        console.log('📋 Journey steps fetched:', journeySteps?.length || 0, 'steps');

        // Get user profile data for completion checking
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('❌ Error fetching profile:', profileError);
          throw profileError;
        }

        console.log('👤 Profile data:', {
          hasProfile: !!profile,
          professionalType: profile?.professional_type,
          yearsExperience: profile?.years_of_experience,
          certificationsCount: profile?.certifications?.length || 0,
          availabilityCount: profile?.availability?.length || 0
        });

        // Get additional completion data based on user role
        let completionData = {};
        
        if (userRole === 'family') {
          const [careAssessment, careRecipient, carePlans, medications, mealPlans] = await Promise.all([
            supabase.from('care_needs_family').select('id').eq('profile_id', userId).maybeSingle(),
            supabase.from('care_recipient_profiles').select('*').eq('user_id', userId).maybeSingle(),
            supabase.from('care_plans').select('id, title').eq('family_id', userId),
            supabase.from('medications').select('id').eq('care_plan_id', userId),
            supabase.from('meal_plans').select('id').eq('care_plan_id', userId)
          ]);
          
          completionData = {
            careAssessment: careAssessment.data,
            careRecipient: careRecipient.data,
            carePlans: carePlans.data || [],
            medications: medications.data || [],
            mealPlans: mealPlans.data || []
          };
        } else if (userRole === 'professional') {
          console.log('🔍 Fetching professional-specific data...');
          
          // Use the same comprehensive logic as useEnhancedProfessionalProgress
          const [documentsResult, assignmentsResult] = await Promise.all([
            supabase.from('professional_documents').select('*').eq('user_id', userId),
            supabase.from('care_team_members').select('*').eq('caregiver_id', userId)
          ]);
          
          if (documentsResult.error) {
            console.error('❌ Error fetching documents:', documentsResult.error);
          }
          if (assignmentsResult.error) {
            console.error('❌ Error fetching assignments:', assignmentsResult.error);
          }
          
          const documents = documentsResult.data || [];
          const assignments = assignmentsResult.data || [];
          
          console.log('📄 Professional data fetched:', {
            documentsCount: documents.length,
            assignmentsCount: assignments.length
          });
          
          completionData = {
            documents,
            assignments
          };
        }

        // Process steps with completion status
        const processedSteps = journeySteps?.map(step => {
          let completed = false;
          
          console.log(`🔍 Checking step ${step.step_number}: ${step.title}`);
          
          // Check completion based on step number and user role
          if (userRole === 'family') {
            switch (step.step_number) {
              case 1:
                completed = !!(profile?.full_name);
                break;
              case 2:
                completed = !!(completionData as any).careAssessment;
                break;
              case 3:
                completed = !!((completionData as any).careRecipient?.full_name);
                break;
              case 4:
                completed = !!(completionData as any).careRecipient;
                break;
              case 5:
                completed = ((completionData as any).medications?.length || 0) > 0;
                break;
              case 6:
                completed = ((completionData as any).mealPlans?.length || 0) > 0;
                break;
              case 7:
                completed = profile?.visit_scheduling_status === 'scheduled' || profile?.visit_scheduling_status === 'completed';
                break;
              case 8:
                completed = profile?.visit_scheduling_status === 'completed';
                break;
              default:
                completed = false;
            }
          } else if (userRole === 'professional') {
            // Use the same completion logic as useEnhancedProfessionalProgress
            switch (step.step_number) {
              case 1: // Account creation
                completed = !!userId; // Always true for existing users
                console.log(`✅ Step 1 (Account): ${completed}`);
                break;
              case 2: // Professional profile
                completed = !!(profile?.professional_type && profile?.years_of_experience);
                console.log(`🔍 Step 2 (Profile): ${completed}`, {
                  professionalType: profile?.professional_type,
                  yearsExperience: profile?.years_of_experience
                });
                break;
              case 3: // Documents upload
                const documentsCount = ((completionData as any).documents?.length || 0);
                completed = documentsCount > 0;
                console.log(`📄 Step 3 (Documents): ${completed} (count: ${documentsCount})`);
                break;
              case 4: // Availability
                const availabilityCount = profile?.availability?.length || 0;
                completed = availabilityCount > 0;
                console.log(`📅 Step 4 (Availability): ${completed} (count: ${availabilityCount})`);
                break;
              case 5: // Training modules - check certifications
                const certificationsCount = profile?.certifications?.length || 0;
                completed = !!(profile?.professional_type && certificationsCount > 0);
                console.log(`🎓 Step 5 (Certifications): ${completed} (count: ${certificationsCount})`);
                break;
              case 6: // Assignments
                const assignmentsCount = ((completionData as any).assignments?.length || 0);
                completed = assignmentsCount > 0;
                console.log(`💼 Step 6 (Assignments): ${completed} (count: ${assignmentsCount})`);
                break;
              default:
                // Fallback to onboarding_progress if available
                const onboardingProgress = profile?.onboarding_progress || {};
                completed = onboardingProgress[step.step_number.toString()] === true;
                console.log(`🔄 Step ${step.step_number} (Fallback): ${completed}`);
            }
          } else if (userRole === 'community') {
            // Basic completion logic for community users
            switch (step.step_number) {
              case 1:
                completed = !!(profile?.full_name);
                break;
              case 2:
                completed = !!(profile?.location);
                break;
              case 3:
                completed = !!(profile?.phone_number);
                break;
              default:
                completed = false;
            }
          }

          console.log(`✅ Step ${step.step_number} final result: ${completed}`);

          // Ensure category is valid, fallback to 'foundation' if not
          const validCategory = isValidCategory(step.category) ? step.category : 'foundation';

          return {
            id: step.id,
            step_number: step.step_number,
            title: step.title,
            description: step.description,
            category: validCategory,
            is_optional: step.is_optional || false,
            completed,
            accessible: true // For admin view, all steps are accessible to see
          };
        }) || [];

        console.log('📊 Final processed steps:', processedSteps.map(s => ({
          step: s.step_number,
          title: s.title,
          completed: s.completed
        })));

        setSteps(processedSteps);
        
      } catch (error) {
        console.error("❌ Error fetching user-specific progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, [userId, userRole]);

  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
  const nextStep = steps.find(step => !step.completed && step.accessible);

  console.log('📈 Final calculation:', {
    completedSteps,
    totalSteps: steps.length,
    completionPercentage,
    nextStep: nextStep?.title
  });

  return {
    steps,
    completionPercentage,
    nextStep,
    loading
  };
};
