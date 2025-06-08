
import { useState, useEffect } from 'react';
import { useUserSpecificProgress } from './useUserSpecificProgress';
import type { UserRole } from '@/types/userRoles';

// This hook provides user journey progress for admin views
// It uses the same source of truth as the family dashboard
export const useUserJourneyProgress = (userId: string, userRole: UserRole) => {
  const progressData = useUserSpecificProgress(userId, userRole);
  
  // Return data in the format expected by existing admin components
  return {
    ...progressData,
    // Legacy compatibility
    currentStep: progressData.nextStep?.id || progressData.steps.length,
    totalSteps: progressData.steps.length,
    stepsCompleted: progressData.steps.filter(s => s.completed).length,
  };
};
