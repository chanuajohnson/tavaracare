
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { videoAvailabilityService } from '@/services/videoAvailabilityService';
import { toast } from 'sonner';

export const useVideoAvailability = () => {
  const { user } = useAuth();
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch initial video availability status
  useEffect(() => {
    const fetchVideoAvailability = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const available = await videoAvailabilityService.getVideoAvailability(user.id);
        setVideoAvailable(available);
      } catch (error) {
        console.error('Error fetching video availability:', error);
        toast.error('Failed to load video availability status');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoAvailability();
  }, [user?.id]);

  // Toggle video availability
  const toggleVideoAvailability = async () => {
    if (!user?.id || updating) return;

    setUpdating(true);
    const newAvailability = !videoAvailable;

    try {
      // Optimistic update
      setVideoAvailable(newAvailability);
      
      await videoAvailabilityService.updateVideoAvailability(user.id, newAvailability);
      
      toast.success(
        newAvailability 
          ? 'Video calls enabled! Families can now see you offer video consultations.' 
          : 'Video calls disabled. You can re-enable anytime.'
      );
    } catch (error) {
      // Revert optimistic update on error
      setVideoAvailable(!newAvailability);
      console.error('Error updating video availability:', error);
      toast.error('Failed to update video availability. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return {
    videoAvailable,
    loading,
    updating,
    toggleVideoAvailability
  };
};
