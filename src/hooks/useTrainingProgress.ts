
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

export type TrainingModule = {
  id: string;
  title: string;
  icon: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  completed: boolean;
}

export const useTrainingProgress = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProgress, setTotalProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrainingProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch all training modules
        const { data: trainingModules, error: modulesError } = await supabase
          .from('training_modules')
          .select('*')
          .order('order_index');
        
        if (modulesError) throw modulesError;
        
        // Fetch user progress for these modules
        const { data: userProgress, error: progressError } = await supabase
          .from('user_module_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (progressError) throw progressError;
        
        // Map the data to the format needed by the component
        const mappedModules = trainingModules.map(module => {
          // Find user progress for this module
          const progress = userProgress?.find(p => p.module_id === module.id);
          
          // Calculate progress percentage
          const completedLessons = progress?.completed_lessons || 0;
          const progressPercentage = module.total_lessons > 0 
            ? Math.round((completedLessons / module.total_lessons) * 100) 
            : 0;
          
          return {
            id: module.id,
            title: module.title,
            icon: module.icon,
            progress: progressPercentage,
            totalLessons: module.total_lessons,
            completedLessons: completedLessons,
            estimatedTime: module.estimated_time,
            completed: progress?.status === 'completed'
          };
        });
        
        setModules(mappedModules);
        
        // Calculate overall progress
        const totalLessons = mappedModules.reduce((sum, module) => sum + module.totalLessons, 0);
        const totalCompleted = mappedModules.reduce((sum, module) => sum + module.completedLessons, 0);
        const overallProgress = totalLessons > 0 
          ? Math.round((totalCompleted / totalLessons) * 100) 
          : 0;
        
        setTotalProgress(overallProgress);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching training progress:', error);
        setError('Failed to load training progress');
        setLoading(false);
      }
    };
    
    fetchTrainingProgress();
  }, [user]);
  
  return { modules, loading, error, totalProgress };
};
