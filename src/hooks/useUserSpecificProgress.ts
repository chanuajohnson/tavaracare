
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  isAccountCreated,
  isProfileComplete,
  isAvailabilitySet,
  hasDocuments,
  hasAssignments,
  hasCertifications,
  getDocumentCount
} from './professional/completionCheckers';
import {
  fetchProfileData,
  fetchDocuments,
  fetchAssignments
} from './professional/dataFetchers';

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

        // Get completion data based on user role
        let completionData = {};
        
        if (userRole === 'family') {
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

          console.log('👤 Family profile data:', {
            hasProfile: !!profile,
            fullName: profile?.full_name
          });

          const [careAssessment, careRecipient, carePlans, medications, mealPlans] = await Promise.all([
            supabase.from('care_needs_family').select('id').eq('profile_id', userId).maybeSingle(),
            supabase.from('care_recipient_profiles').select('*').eq('user_id', userId).maybeSingle(),
            supabase.from('care_plans').select('id, title').eq('family_id', userId),
            supabase.from('medications').select('id').eq('care_plan_id', userId),
            supabase.from('meal_plans').select('id').eq('care_plan_id', userId)
          ]);
          
          completionData = {
            profile,
            careAssessment: careAssessment.data,
            careRecipient: careRecipient.data,
            carePlans: carePlans.data || [],
            medications: medications.data || [],
            mealPlans: mealPlans.data || []
          };
        } else if (userRole === 'professional') {
          console.log('🔍 Fetching professional-specific data using shared fetchers...');
          
          // Use the same data fetchers as the refactored professional hooks
          const [profileData, documents, assignments] = await Promise.all([
            fetchProfileData(userId),
            fetchDocuments(userId),
            fetchAssignments(userId)
          ]);
          
          console.log('📄 Professional data fetched:', {
            hasProfile: !!profileData,
            documentsCount: documents.length,
            assignmentsCount: assignments.length,
            professionalType: profileData?.professional_type,
            yearsExperience: profileData?.years_of_experience
          });
          
          completionData = {
            profile: profileData,
            documents,
            assignments
          };
        } else if (userRole === 'community') {
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

          completionData = { profile };
        }

        // Process steps with completion status
        const processedSteps = journeySteps?.map(step => {
          let completed = false;
          
          console.log(`🔍 Checking step ${step.step_number}: ${step.title}`);
          
          // Check completion based on step number and user role
          if (userRole === 'family') {
            const { profile, careAssessment, careRecipient, medications, mealPlans, carePlans } = completionData as any;
            
            // Step numbers match journey_steps table: 1, 2, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15
            switch (step.step_number) {
              case 1: // Create your account
                completed = !!(profile?.full_name);
                break;
              case 2: // Complete your registration
                completed = !!(profile?.full_name && profile?.phone_number && profile?.address && profile?.care_recipient_name && profile?.relationship);
                break;
              case 5: // Complete Initial Care Assessment
                completed = !!careAssessment;
                break;
              case 6: // Complete Your Loved One's Legacy Story
                completed = !!(careRecipient?.full_name);
                break;
              case 7: // See Your Instant Caregiver Matches
                completed = !!(profile?.full_name && profile?.phone_number && profile?.address && profile?.care_recipient_name && profile?.relationship) && !!careAssessment;
                break;
              case 8: // Set Up Medication Management
                completed = (medications?.length || 0) > 0;
                break;
              case 9: // Set Up Meal Management
                completed = (mealPlans?.length || 0) > 0;
                break;
              case 10: // Schedule Your Tavara.Care Visit
                completed = profile?.visit_scheduling_status === 'scheduled' || profile?.visit_scheduling_status === 'completed';
                break;
              case 12: // Schedule Trial Day
                completed = false; // Future: check trial scheduling
                break;
              case 13: // Pay for Trial Day
                completed = false; // Future: check payment_transactions
                break;
              case 14: // Begin Your Trial
                completed = false; // Future: check trial status
                break;
              case 15: // Rate & Choose Your Path
                completed = profile?.visit_scheduling_status === 'completed';
                break;
              default:
                completed = false;
            }
          } else if (userRole === 'professional') {
            const { profile, documents, assignments } = completionData as any;
            
            // Use the same completion logic as the refactored professional hooks
            switch (step.step_number) {
              case 1: // Account creation
                completed = isAccountCreated(userId);
                console.log(`✅ Step 1 (Account): ${completed}`);
                break;
              case 2: // Professional profile
                completed = isProfileComplete(profile);
                console.log(`🔍 Step 2 (Profile): ${completed}`, {
                  professionalType: profile?.professional_type,
                  yearsExperience: profile?.years_of_experience
                });
                break;
              case 3: // Availability - FIXED: Use care_schedule instead of availability
                completed = isAvailabilitySet(profile);
                console.log(`📅 Step 3 (Availability): ${completed}`, {
                  careSchedule: profile?.care_schedule,
                  careScheduleType: typeof profile?.care_schedule
                });
                break;
              case 4: // Documents upload
                completed = hasDocuments(documents);
                console.log(`📄 Step 4 (Documents): ${completed} (count: ${documents?.length || 0})`);
                break;
              case 5: // Assignments
                completed = hasAssignments(assignments);
                console.log(`💼 Step 5 (Assignments): ${completed} (count: ${assignments?.length || 0})`);
                break;
              case 6: // Training/Certifications
                completed = hasCertifications(profile);
                console.log(`🎓 Step 6 (Training/Certifications): ${completed}`, {
                  certificationsCount: profile?.certifications?.length || 0
                });
                break;
              default:
                // Fallback to onboarding_progress if available
                const onboardingProgress = profile?.onboarding_progress || {};
                completed = onboardingProgress[step.step_number.toString()] === true;
                console.log(`🔄 Step ${step.step_number} (Fallback): ${completed}`);
            }
          } else if (userRole === 'community') {
            const { profile } = completionData as any;
            
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

        console.log('📊 Final processed steps for admin view:', processedSteps.map(s => ({
          step: s.step_number,
          title: s.title,
          completed: s.completed ? '✅' : '❌',
          role: userRole
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

  console.log('📈 Final admin calculation:', {
    userId,
    userRole,
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
