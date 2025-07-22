
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
      console.log('🚫 useStoredJourneyProgress: Missing userId or userRole', { userId, userRole });
      setLoading(false);
      return;
    }

    const fetchStoredProgress = async () => {
      try {
        setLoading(true);
        console.log('🔍 useStoredJourneyProgress: Fetching stored progress for', { userId, userRole });
        
        // Try direct query first (for users accessing their own data)
        const { data: directProgress, error: directError } = await supabase
          .from('user_journey_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (directError) {
          console.log('⚠️ Direct query failed, trying admin function:', directError.message);
          
          // Fallback to admin function if direct query fails
          const { data: journeyProgress, error: journeyError } = await supabase
            .rpc('admin_get_user_journey_progress', { target_user_id: userId });

          if (journeyError) {
            console.error('❌ Admin function also failed:', journeyError);
            setStoredProgress(null);
          } else if (journeyProgress && Array.isArray(journeyProgress) && journeyProgress.length > 0) {
            const progress = journeyProgress[0];
            console.log('✅ Found stored journey progress via admin function:', {
              userId,
              userRole,
              completionPercentage: progress.completion_percentage,
              currentStep: progress.current_step,
              totalSteps: progress.total_steps,
              lastActivity: progress.last_activity_at
            });
            setStoredProgress(progress);
          } else {
            console.log('⚠️ No progress data from admin function for user:', { userId, userRole });
            setStoredProgress(null);
          }
        } else if (directProgress) {
          console.log('✅ Found stored journey progress via direct query:', {
            userId,
            userRole,
            completionPercentage: directProgress.completion_percentage,
            currentStep: directProgress.current_step,
            totalSteps: directProgress.total_steps,
            lastActivity: directProgress.last_activity_at
          });
          setStoredProgress(directProgress);
        } else {
          console.log('⚠️ No stored progress data available for user:', { userId, userRole });
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
      totalSteps,
      lastActivity: storedProgress.last_activity_at
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
