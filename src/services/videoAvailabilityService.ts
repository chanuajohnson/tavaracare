
import { supabase } from '@/lib/supabase';

export interface VideoAvailabilityResponse {
  success: boolean;
  error?: string;
}

export const videoAvailabilityService = {
  async updateVideoAvailability(userId: string, available: boolean): Promise<VideoAvailabilityResponse> {
    try {
      const { error } = await supabase.rpc('update_video_availability', {
        user_id_param: userId,
        available: available
      });

      if (error) {
        console.error('Error updating video availability:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Service error updating video availability:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },

  async getVideoAvailability(userId: string): Promise<{ available: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('video_available')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching video availability:', error);
        return { available: false, error: error.message };
      }

      return { available: data?.video_available || false };
    } catch (error) {
      console.error('Service error fetching video availability:', error);
      return { 
        available: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
};
