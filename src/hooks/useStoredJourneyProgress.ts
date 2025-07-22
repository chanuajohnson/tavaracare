
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface StoredJourneyProgressData {
  steps: any[];
  completionPercentage: number;
  nextStep?: any;
  currentStage: string;
  loading: boolean;
  totalSteps: number;
  completedSteps: number;
}

export const useStoredJourneyProgress = (userId: string, userRole: string): StoredJourneyProgressData => {
  const [loading, setLoading] = useState(true);
  const [storedProgress, setStoredProgress] = useState<any>(null);

  useEffect(() => {
    if (!userId || !userRole) {
      setLoading(false);
      return;
    }

    const fetchStoredProgress = async () => {
      try {
        setLoading(true);
        console.log('🔍 useStoredJourneyProgress: Fetching stored progress for', { userId, userRole });
        
        // First, try to get stored progress from user_journey_progress table
        const { data: journeyProgress, error: journeyError } = await supabase
          .from('user_journey_progress')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (journeyError) {
          console.log('No stored journey progress found:', journeyError);
          setStoredProgress(null);
        } else if (journeyProgress) {
          console.log('✅ Found stored journey progress:', journeyProgress);
          setStoredProgress(journeyProgress);
        } else {
          console.log('No stored progress data available');
          setStoredProgress(null);
        }
      } catch (error) {
        console.error('❌ Error fetching stored progress:', error);
        setStoredProgress(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStoredProgress();
  }, [userId, userRole]);

  // If we have stored progress, use it
  if (storedProgress) {
    const completionPercentage = Math.round(storedProgress.completion_percentage || 0);
    const currentStep = storedProgress.current_step || 1;
    const totalSteps = storedProgress.total_steps || 6;
    
    console.log('📊 Using stored progress data:', {
      userId,
      userRole,
      completionPercentage,
      currentStep,
      totalSteps
    });

    // Create basic step structure for compatibility
    const steps = Array.from({ length: totalSteps }, (_, index) => ({
      id: index + 1,
      step_number: index + 1,
      title: `Step ${index + 1}`,
      description: `Journey step ${index + 1}`,
      completed: index < currentStep,
      accessible: index <= currentStep,
      category: index < 3 ? 'foundation' : index < 5 ? 'scheduling' : 'conversion'
    }));

    const completedSteps = steps.filter(step => step.completed).length;
    const nextStep = steps.find(step => !step.completed && step.accessible);
    
    // Determine stage based on progress
    let currentStage = 'foundation';
    if (completionPercentage >= 80) {
      currentStage = 'conversion';
    } else if (completionPercentage >= 60) {
      currentStage = 'trial';
    } else if (completionPercentage >= 40) {
      currentStage = 'scheduling';
    }

    return {
      steps,
      completionPercentage,
      nextStep,
      currentStage,
      loading,
      totalSteps,
      completedSteps
    };
  }

  // Fallback: return basic structure when no stored data
  console.log('⚠️ No stored progress found, using fallback data for:', { userId, userRole });
  
  return {
    steps: [],
    completionPercentage: 0,
    nextStep: undefined,
    currentStage: 'foundation',
    loading,
    totalSteps: 0,
    completedSteps: 0
  };
};
