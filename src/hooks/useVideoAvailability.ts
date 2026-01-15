
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { videoAvailabilityService } from '@/services/videoAvailabilityService';
import { useTracking } from '@/hooks/useTracking';
import { toast } from 'sonner';

export const useVideoAvailability = () => {
  const { user } = useAuth();
  const { trackEngagement } = useTracking();
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load initial video availability status
  useEffect(() => {
    const loadVideoAvailability = async () => {
      if (!user?.id) return;

      setIsInitialLoading(true);
      const result = await videoAvailabilityService.getVideoAvailability(user.id);
      
      if (result.error) {
        console.error('Failed to load video availability:', result.error);
      } else {
        setIsVideoAvailable(result.available);
      }
      
      setIsInitialLoading(false);
    };

    loadVideoAvailability();
  }, [user?.id]);

  const toggleVideoAvailability = async () => {
    if (!user?.id || isLoading) return;

    const newStatus = !isVideoAvailable;
    setIsLoading(true);

    // Optimistic update
    setIsVideoAvailable(newStatus);

    try {
      const result = await videoAvailabilityService.updateVideoAvailability(user.id, newStatus);

      if (result.success) {
        // Track the toggle event
        await trackEngagement('video_availability_toggle', {
          user_id: user.id,
          new_status: newStatus,
          source: 'dashboard_toggle'
        });

        toast.success(
          newStatus 
            ? 'Video calls enabled! You\'ll stand out to families.' 
            : 'Video calls disabled.'
        );
      } else {
        // Revert optimistic update on error
        setIsVideoAvailable(!newStatus);
        toast.error(result.error || 'Failed to update video availability');
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsVideoAvailable(!newStatus);
      toast.error('Failed to update video availability');
      console.error('Toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isVideoAvailable,
    isLoading,
    isInitialLoading,
    toggleVideoAvailability
  };
};
