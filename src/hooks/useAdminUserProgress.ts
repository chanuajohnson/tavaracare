
import { useMemo } from 'react';
import type { UserRole } from "@/types/userRoles";

interface ProgressStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface UseAdminUserProgressReturn {
  steps: ProgressStep[];
  completionPercentage: number;
  nextStep?: { id: number; title: string };
  loading: boolean;
}

export const useAdminUserProgress = (userId: string, userRole: UserRole): UseAdminUserProgressReturn => {
  // For now, return a simple mock structure that matches the expected interface
  // The actual progress will be handled by the TAV hooks in the MiniJourneyProgress component
  const mockSteps: ProgressStep[] = useMemo(() => {
    if (userRole === 'family') {
      return [
        { id: 1, title: "Complete Profile", description: "Basic information", completed: true },
        { id: 2, title: "Care Assessment", description: "Care needs evaluation", completed: true },
        { id: 3, title: "Care Plan Setup", description: "Initial care planning", completed: false },
        { id: 4, title: "Team Formation", description: "Build care team", completed: false },
        { id: 5, title: "Service Activation", description: "Start care services", completed: false }
      ];
    } else if (userRole === 'professional') {
      return [
        { id: 1, title: "Profile Setup", description: "Professional information", completed: true },
        { id: 2, title: "Verification", description: "Background check", completed: true },
        { id: 3, title: "Training Modules", description: "Complete training", completed: false },
        { id: 4, title: "Certification", description: "Get certified", completed: false },
        { id: 5, title: "Job Matching", description: "Find assignments", completed: false }
      ];
    } else {
      return [
        { id: 1, title: "Account Setup", description: "Basic setup", completed: true },
        { id: 2, title: "Community Onboarding", description: "Join community", completed: false }
      ];
    }
  }, [userRole]);

  const completedSteps = mockSteps.filter(step => step.completed).length;
  const completionPercentage = Math.round((completedSteps / mockSteps.length) * 100);
  const nextStep = mockSteps.find(step => !step.completed);

  return {
    steps: mockSteps,
    completionPercentage,
    nextStep,
    loading: false
  };
};
