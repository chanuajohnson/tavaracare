
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
        let progressData = null;
        
        try {
          const { data: directProgress, error: directError } = await supabase
            .from('user_journey_progress')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data exists

          if (directError) {
            // Check if it's an RLS error specifically
            if (directError.code === '42P17' || directError.message?.includes('infinite recursion')) {
              console.log('🔄 RLS infinite recursion detected, using fallback approach');
              throw new Error('RLS_RECURSION');
            } else {
              console.log('⚠️ Direct query failed, trying admin function:', directError.message);
              throw directError;
            }
          } else if (directProgress) {
            progressData = directProgress;
            console.log('✅ Found stored journey progress via direct query:', {
              userId,
              userRole,
              completionPercentage: progressData.completion_percentage,
              currentStep: progressData.current_step,
              totalSteps: progressData.total_steps,
              lastActivity: progressData.last_activity_at
            });
          }
        } catch (error: any) {
          console.log('⚠️ Direct query failed, trying admin function:', error.message);
          
          // Fallback to admin function if direct query fails
          try {
            const { data: journeyProgress, error: journeyError } = await supabase
              .rpc('admin_get_user_journey_progress', { target_user_id: userId });

            if (journeyError) {
              console.error('❌ Admin function also failed:', journeyError);
              // Don't throw here, continue to use fallback data
            } else if (journeyProgress && Array.isArray(journeyProgress) && journeyProgress.length > 0) {
              progressData = journeyProgress[0];
              console.log('✅ Found stored journey progress via admin function:', {
                userId,
                userRole,
                completionPercentage: progressData.completion_percentage,
                currentStep: progressData.current_step,
                totalSteps: progressData.total_steps,
                lastActivity: progressData.last_activity_at
              });
            } else {
              console.log('⚠️ No progress data from admin function for user:', { userId, userRole });
            }
          } catch (adminError) {
            console.error('❌ Admin function call failed:', adminError);
            // Continue to fallback
          }
        }

        // Set the progress data (could be null, which triggers fallback)
        setStoredProgress(progressData);
        
        if (!progressData) {
          console.log('⚠️ No stored progress data available for user, using calculated fallback:', { userId, userRole });
        }
        
      } catch (error) {
        console.error('❌ Critical error fetching stored progress:', error);
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
  
  // Return minimal functional data that won't break the UI
  const fallbackSteps = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    step_number: index + 1,
    title: `Step ${index + 1}`,
    description: `Journey step ${index + 1}`,
    completed: false,
    accessible: index === 0, // Only first step accessible
    category: index < 2 ? 'foundation' : index < 4 ? 'scheduling' : 'conversion'
  }));
  
  return {
    steps: fallbackSteps,
    completionPercentage: 0,
    nextStep: fallbackSteps[0],
    currentStage: 'foundation',
    loading,
    totalSteps: 6,
    completedSteps: 0
  };
};
