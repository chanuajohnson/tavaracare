
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfessionalStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  accessible: boolean;
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

  // Base steps definition - Step 5 updated with new title
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
      stage: "foundation",
      isInteractive: true
    },
    { 
      id: 4, 
      title: "Upload certifications & documents", 
      description: "Verify your credentials and background", 
      link: "/professional/profile?tab=documents",
      category: "documents",
      stage: "qualification",
      isInteractive: true
    },
    { 
      id: 5, 
      title: "Match with Tavara Families", 
      description: "Get matched with families and begin your caregiving journey", 
      link: "/dashboard/professional#family-matches",
      category: "assignments",
      stage: "active",
      isInteractive: false
    },
    { 
      id: 6, 
      title: "Complete training modules", 
      description: "Enhance your skills with our professional development courses", 
      link: "/professional/training",
      category: "training",
      stage: "training",
      isInteractive: true
    }
  ];

  const getButtonText = (step: typeof baseSteps[0], completed: boolean, accessible: boolean) => {
    if (!accessible) {
      return "🔒 Locked";
    }
    
    if (completed) {
      switch (step.id) {
        case 1: return "✓ Account Created";
        case 2: return "✓ Profile Complete";
        case 3: return "Edit Availability";
        case 4: return "View Documents";
        case 5: return "View Family Matches";
        case 6: return "Continue Training";
        default: return "✓ Complete";
      }
    }
    
    switch (step.id) {
      case 1: return "Complete Setup";
      case 2: return "Complete Profile";
      case 3: return "Set Availability";
      case 4: return "Upload Documents";
      case 5: return "View Family Matches";
      case 6: return "Start Training";
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
      
      // Fetch profile data
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

      // Fetch documents with explicit typing
      const { data: documentsData, error: documentsError } = await supabase
        .from('professional_documents')
        .select('*')
        .eq('user_id', userId);

      if (documentsError) {
        console.error('❌ Documents fetch error:', documentsError);
        throw documentsError;
      }

      // Use type assertion to fix TypeScript inference
      const documents = (documentsData || []) as Array<{ document_type: string; file_name: string; [key: string]: any }>;
      console.log('📄 Documents data fetched:', {
        documentsCount: documents.length,
        documents: documents.map(d => ({ type: d.document_type, name: d.file_name }))
      });

      // Fetch care team assignments with explicit typing
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('care_team_members')
        .select('*')
        .eq('caregiver_id', userId);

      if (assignmentsError) {
        console.error('❌ Assignments fetch error:', assignmentsError);
        throw assignmentsError;
      }

      // Use type assertion to fix TypeScript inference
      const assignments = (assignmentsData || []) as Array<{ id: string; status: string; role: string; [key: string]: any }>;
      console.log('💼 Assignments data fetched:', {
        assignmentsCount: assignments.length,
        assignments: assignments.map(a => ({ id: a.id, status: a.status, role: a.role }))
      });

      const processedSteps: ProfessionalStep[] = baseSteps.map(baseStep => {
        let completed = false;

        console.log(`🔍 Checking step ${baseStep.id}: ${baseStep.title}`);

        switch (baseStep.id) {
          case 1: // Account creation
            completed = !!userId;
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
          case 3: // Availability
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
          case 4: // Documents upload
            completed = documents.length > 0;
            console.log(`📄 Step 4 (Documents): ${completed} (count: ${documents.length})`);
            break;
          case 5: // Assignments (reordered from Step 6)
            completed = assignments.length > 0;
            console.log(`💼 Step 5 (Assignments): ${completed} (count: ${assignments.length})`);
            break;
          case 6: // Training modules (reordered from Step 5) - check certifications
            const certificationsArray = profile?.certifications;
            const certificationsCount = Array.isArray(certificationsArray) ? certificationsArray.length : 0;
            const hasProfileTypeForTraining = !!profile?.professional_type;
            completed = hasProfileTypeForTraining && certificationsCount > 0;
            console.log(`🎓 Step 6 (Training/Certifications): ${completed}`, {
              certificationsArray,
              certificationsCount,
              hasProfileTypeForTraining,
              isArray: Array.isArray(certificationsArray)
            });
            break;
        }

        // Determine accessibility - Step 5 is only accessible if steps 1-4 are completed
        let accessible = true;
        if (baseStep.id === 5) {
          // Check if steps 1-4 are completed
          const step1Complete = !!userId;
          const step2Complete = !!(profile?.professional_type && profile?.years_of_experience);
          const step3Complete = (typeof profile?.care_schedule === 'string' 
            ? profile.care_schedule.split(',').filter(s => s.trim()).length 
            : Array.isArray(profile?.care_schedule) ? profile.care_schedule.length : 0) > 0;
          const step4Complete = documents.length > 0;
          
          accessible = step1Complete && step2Complete && step3Complete && step4Complete;
          console.log(`🔒 Step 5 accessibility check:`, {
            step1Complete,
            step2Complete,
            step3Complete,
            step4Complete,
            accessible
          });
        }

        console.log(`📊 Step ${baseStep.id} final result: ${completed ? '✅' : '❌'} ${baseStep.title} (accessible: ${accessible})`);

        return {
          ...baseStep,
          completed,
          accessible,
          buttonText: getButtonText(baseStep, completed, accessible)
        };
      });

      console.log('📈 Final processed steps summary:', processedSteps.map(s => ({
        step: s.id,
        title: s.title,
        completed: s.completed ? '✅' : '❌',
        accessible: s.accessible ? '🔓' : '🔒',
        stage: s.stage
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
  const nextStep = steps.find(step => !step.completed && step.accessible);

  console.log('📊 Final calculation summary:', {
    userId,
    completedSteps,
    totalSteps,
    completionPercentage,
    nextStepTitle: nextStep?.title,
    stagesBreakdown: {
      foundation: steps.filter(s => s.stage === 'foundation').map(s => ({ title: s.title, completed: s.completed, accessible: s.accessible })),
      qualification: steps.filter(s => s.stage === 'qualification').map(s => ({ title: s.title, completed: s.completed, accessible: s.accessible })),
      training: steps.filter(s => s.stage === 'training').map(s => ({ title: s.title, completed: s.completed, accessible: s.accessible })),
      active: steps.filter(s => s.stage === 'active').map(s => ({ title: s.title, completed: s.completed, accessible: s.accessible }))
    }
  });

  return {
    steps,
    completionPercentage,
    nextStep,
    loading
  };
};
