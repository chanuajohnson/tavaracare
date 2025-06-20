
import { useState, useEffect } from 'react';
import { fetchProfileData, fetchDocuments, fetchAssignments } from './professional/dataFetchers';
import {
  isAccountCreated,
  isProfileComplete,
  isAvailabilitySet,
  hasDocuments,
  hasAssignments,
  hasCertifications,
  checkStepAccessibility
} from './professional/completionCheckers';
import { baseSteps, getButtonText } from './professional/stepDefinitions';
import { ProfessionalStep, SpecificUserProfessionalProgressData } from './professional/types';

export const useSpecificUserProfessionalProgress = (userId: string): SpecificUserProfessionalProgressData => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<ProfessionalStep[]>([]);

  const checkStepCompletion = async () => {
    if (!userId) {
      console.log('🚫 useSpecificUserProfessionalProgress: No userId provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 useSpecificUserProfessionalProgress: Starting check for userId:', userId);
      
      // Fetch all data in parallel with proper typing
      const [profile, documents, assignments] = await Promise.all([
        fetchProfileData(userId),
        fetchDocuments(userId),
        fetchAssignments(userId)
      ]);

      const processedSteps: ProfessionalStep[] = baseSteps.map(baseStep => {
        let completed = false;
        let accessible = true;

        console.log(`🔍 Checking step ${baseStep.id}: ${baseStep.title}`);

        switch (baseStep.id) {
          case 1: // Account creation
            completed = isAccountCreated(userId);
            break;
          case 2: // Professional profile
            completed = isProfileComplete(profile);
            break;
          case 3: // Availability
            completed = isAvailabilitySet(profile);
            break;
          case 4: // Documents upload
            completed = hasDocuments(documents);
            break;
          case 5: // Assignments
            completed = hasAssignments(assignments);
            accessible = checkStepAccessibility(baseStep.id, userId, profile, documents);
            break;
          case 6: // Training modules - check certifications
            completed = hasCertifications(profile);
            break;
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
