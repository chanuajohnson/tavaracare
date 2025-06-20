

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfessionalStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  buttonText: string;
  category: string;
  stage: string;
  isInteractive: boolean;
}

interface SpecificUserProfessionalProgressData {
  steps: ProfessionalStep[];
  completionPercentage: number;
  nextStep?: ProfessionalStep;
  loading: boolean;
}

export const useSpecificUserProfessionalProgress = (userId: string): SpecificUserProfessionalProgressData => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<ProfessionalStep[]>([]);

  // Base steps definition - SWAPPED STEPS 3 AND 4
  const baseSteps = [
    { 
      id: 1, 
      title: "Create your account", 
      description: "Set up your Tavara professional account", 
      link: "/auth",
      category: "account",
      stage: "foundation",
      isInteractive: false
    },
    { 
      id: 2, 
      title: "Complete your professional profile", 
      description: "Add your experience, certifications, and specialties", 
      link: "/registration/professional",
      category: "profile",
      stage: "foundation",
      isInteractive: true
    },
    { 
      id: 3, 
      title: "Set your availability preferences", 
      description: "Configure your work schedule and location preferences", 
      link: "/registration/professional?scroll=availability&edit=true",
      category: "availability",
      stage: "foundation", // Changed from matching to foundation
      isInteractive: true
    },
    { 
      id: 4, 
      title: "Upload certifications & documents", 
      description: "Verify your credentials and background", 
      link: "/professional/profile?tab=documents",
      category: "documents",
      stage: "qualification", // Changed from qualification to qualification
      isInteractive: true
    },
    { 
      id: 5, 
      title: "Complete training modules", 
      description: "Enhance your skills with our professional development courses", 
      link: "/professional/training",
      category: "training",
      stage: "qualification",
      isInteractive: true
    },
    { 
      id: 6, 
      title: "Start receiving assignments", 
      description: "Get matched with families and begin your caregiving journey", 
      link: "/professional/profile?tab=assignments",
      category: "assignments",
      stage: "active",
      isInteractive: false
    }
  ];

  const getButtonText = (step: typeof baseSteps[0], completed: boolean) => {
    if (completed) {
      switch (step.id) {
        case 1: return "✓ Account Created";
        case 2: return "✓ Profile Complete";
        case 3: return "Edit Availability";  // Step 3 is now availability
        case 4: return "View Documents";     // Step 4 is now documents
        case 5: return "Continue Training";
        case 6: return "View Assignments";
        default: return "✓ Complete";
      }
    }
    
    switch (step.id) {
      case 1: return "Complete Setup";
      case 2: return "Complete Profile";
      case 3: return "Set Availability";     // Step 3 is now availability
      case 4: return "Upload Documents";     // Step 4 is now documents
      case 5: return "Start Training";
      case 6: return "Get Assignments";
      default: return "Complete";
    }
  };

  const checkStepCompletion = async () => {
    if (!userId) {
      console.log('🚫 useSpecificUserProfessionalProgress: No userId provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 useSpecificUserProfessionalProgress: Starting check for userId:', userId);
      
      // Fetch profile data - exact same queries as useEnhancedProfessionalProgress
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        throw profileError;
      }

      console.log('👤 Profile data fetched:', {
        hasProfile: !!profile,
        professionalType: profile?.professional_type,
        yearsExperience: profile?.years_of_experience,
        certificationsArray: profile?.certifications,
        certificationsCount: profile?.certifications?.length || 0,
        careScheduleArray: profile?.care_schedule,
        careScheduleLength: profile?.care_schedule?.length || 0
      });

      // Fetch documents
      const { data: documents, error: documentsError } = await supabase
        .from('professional_documents')
        .select('*')
        .eq('user_id', userId);

      if (documentsError) {
        console.error('❌ Documents fetch error:', documentsError);
        throw documentsError;
      }

      console.log('📄 Documents data fetched:', {
        documentsCount: documents?.length || 0,
        documents: documents?.map(d => ({ type: d.document_type, name: d.file_name }))
      });

      // Fetch care team assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('care_team_members')
        .select('*')
        .eq('caregiver_id', userId);

      if (assignmentsError) {
        console.error('❌ Assignments fetch error:', assignmentsError);
        throw assignmentsError;
      }

      console.log('💼 Assignments data fetched:', {
        assignmentsCount: assignments?.length || 0,
        assignments: assignments?.map(a => ({ id: a.id, status: a.status, role: a.role }))
      });

      const processedSteps: ProfessionalStep[] = baseSteps.map(baseStep => {
        let completed = false;

        // SWAPPED completion logic for steps 3 and 4
        switch (baseStep.id) {
          case 1: // Account creation
            completed = !!userId; // Always true if userId exists
            console.log(`✅ Step 1 (Account): ${completed} - userId exists: ${!!userId}`);
            break;
          case 2: // Professional profile
            const hasProfileType = !!profile?.professional_type;
            const hasYearsExp = !!profile?.years_of_experience;
            completed = hasProfileType && hasYearsExp;
            console.log(`🔍 Step 2 (Profile): ${completed}`, {
              professionalType: profile?.professional_type,
              yearsExperience: profile?.years_of_experience,
              hasProfileType,
              hasYearsExp
            });
            break;
          case 3: // Availability (was Step 4)
            const careScheduleData = profile?.care_schedule;
            const careScheduleLength = typeof careScheduleData === 'string' 
              ? careScheduleData.split(',').filter(s => s.trim()).length 
              : Array.isArray(careScheduleData) ? careScheduleData.length : 0;
            completed = careScheduleLength > 0;
            console.log(`📅 Step 3 (Availability): ${completed}`, {
              careScheduleData,
              careScheduleLength,
              isString: typeof careScheduleData === 'string',
              isArray: Array.isArray(careScheduleData)
            });
            break;
          case 4: // Documents upload (was Step 3)
            const documentsCount = documents?.length || 0;
            completed = documentsCount > 0;
            console.log(`📄 Step 4 (Documents): ${completed} (count: ${documentsCount})`);
            break;
          case 5: // Training modules - check certifications
            const certificationsArray = profile?.certifications;
            const certificationsCount = Array.isArray(certificationsArray) ? certificationsArray.length : 0;
            const hasProfileTypeForTraining = !!profile?.professional_type;
            completed = hasProfileTypeForTraining && certificationsCount > 0;
            console.log(`🎓 Step 5 (Training/Certifications): ${completed}`, {
              certificationsArray,
              certificationsCount,
              hasProfileTypeForTraining,
              isArray: Array.isArray(certificationsArray)
            });
            break;
          case 6: // Assignments
            const assignmentsCount = assignments?.length || 0;
            completed = assignmentsCount > 0;
            console.log(`💼 Step 6 (Assignments): ${completed} (count: ${assignmentsCount})`);
            break;
        }

        console.log(`📊 Step ${baseStep.id} final result: ${completed ? '✅' : '❌'} ${baseStep.title}`);

        return {
          ...baseStep,
          completed,
          buttonText: getButtonText(baseStep, completed)
        };
      });

      console.log('📈 Final processed steps summary:', processedSteps.map(s => ({
        step: s.id,
        title: s.title,
        completed: s.completed ? '✅' : '❌'
      })));

      setSteps(processedSteps);
    } catch (error) {
      console.error("❌ Error in useSpecificUserProfessionalProgress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      console.log('🚀 useSpecificUserProfessionalProgress: useEffect triggered for userId:', userId);
      checkStepCompletion();
    } else {
      console.log('⚠️ useSpecificUserProfessionalProgress: No userId provided, setting loading false');
      setLoading(false);
    }
  }, [userId]);

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const nextStep = steps.find(step => !step.completed);

  console.log('📊 Final calculation summary:', {
    userId,
    completedSteps,
    totalSteps,
    completionPercentage,
    nextStepTitle: nextStep?.title,
    stepsCompleted: steps.filter(s => s.completed).map(s => s.title)
  });

  return {
    steps,
    completionPercentage,
    nextStep,
    loading
  };
};
