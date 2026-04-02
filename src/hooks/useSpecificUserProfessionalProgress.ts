
import { useState, useEffect } from 'react';
import { fetchProfileData, fetchDocuments, fetchAssignments, fetchReferences, fetchScreenings, fetchScreeningSessions } from './professional/dataFetchers';
import {
  isAccountCreated,
  isProfileComplete,
  isAvailabilitySet,
  hasDocuments,
  hasAssignments,
  hasCertifications,
  hasRequiredReferences,
  hasPassedScreening,
  checkStepAccessibility,
  getDocumentCount,
  getMissingDocumentTypes
} from './professional/completionCheckers';
import { baseSteps, getButtonText, getDocumentNavigationLink } from './professional/stepDefinitions';
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
      
      const [profile, documents, assignments, references, screenings, screeningSessions] = await Promise.all([
        fetchProfileData(userId),
        fetchDocuments(userId),
        fetchAssignments(userId),
        fetchReferences(userId),
        fetchScreenings(userId),
        fetchScreeningSessions(userId)
      ]);

      // Determine screening session status
      const totalSessions = screeningSessions?.length || 0;
      const completedSessions = screeningSessions?.filter(
        (s: any) => s.status === 'completed' || s.status === 'reviewed'
      ).length || 0;
      const hasPendingSessions = screeningSessions?.some(
        (s: any) => s.status === 'pending' || s.status === 'in_progress'
      ) || false;
      const allSessionsComplete = totalSessions > 0 && completedSessions === totalSessions;
      const screeningComplete = hasPassedScreening(screenings) || allSessionsComplete;

      const processedSteps: ProfessionalStep[] = baseSteps.map(baseStep => {
        let completed = false;
        let accessible = true;
        let link = baseStep.link;

        console.log(`🔍 Checking step ${baseStep.id}: ${baseStep.title}`);

        switch (baseStep.id) {
          case 1:
            completed = isAccountCreated(userId);
            break;
          case 2:
            completed = isProfileComplete(profile);
            break;
          case 3:
            completed = isAvailabilitySet(profile);
            break;
          case 4:
            completed = hasDocuments(documents);
            link = getDocumentNavigationLink(completed);
            break;
          case 5:
            completed = hasRequiredReferences(references);
            break;
          case 6:
            completed = hasPassedScreening(screenings);
            break;
          case 7:
            completed = hasAssignments(assignments);
            accessible = checkStepAccessibility(baseStep.id, userId, profile, documents, references, screenings);
            break;
          case 8:
            completed = hasCertifications(profile);
            break;
        }

        console.log(`📊 Step ${baseStep.id} final result: ${completed ? '✅' : '❌'} ${baseStep.title} (accessible: ${accessible})`);

        const documentsCount = getDocumentCount(documents);
        const hasDocsForButtonText = completed && documentsCount > 0;

        return {
          ...baseStep,
          link,
          completed,
          accessible,
          buttonText: getButtonText(baseStep, completed, accessible, hasDocsForButtonText, documents)
        };
      });

      console.log('📈 Final processed steps summary:', processedSteps.map(s => ({
        step: s.id,
        title: s.title,
        completed: s.completed ? '✅' : '❌',
        accessible: s.accessible ? '🔓' : '🔒',
        stage: s.stage,
        link: s.link,
        missingDocs: s.id === 4 ? getMissingDocumentTypes(documents) : undefined
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
      vetting: steps.filter(s => s.stage === 'vetting').map(s => ({ title: s.title, completed: s.completed, accessible: s.accessible })),
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
