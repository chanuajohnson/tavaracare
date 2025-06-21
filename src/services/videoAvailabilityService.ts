
import { supabase } from '@/lib/supabase';

export interface VideoAvailabilityUpdate {
  userId: string;
  available: boolean;
}

export class VideoAvailabilityService {
  /**
   * Update professional's video availability status
   */
  async updateVideoAvailability(userId: string, available: boolean): Promise<void> {
    const { error } = await supabase.rpc('update_video_availability', {
      user_id_param: userId,
      available: available
    });

    if (error) {
      console.error('Error updating video availability:', error);
      throw new Error(`Failed to update video availability: ${error.message}`);
    }
  }

  /**
   * Get professional's current video availability status
   */
  async getVideoAvailability(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('video_available')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching video availability:', error);
      throw new Error(`Failed to fetch video availability: ${error.message}`);
    }

    return data?.video_available || false;
  }

  /**
   * Get professionals with video availability for family matching
   */
  async getProfessionalsWithVideoAvailability() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, video_available, professional_type, certifications, bio')
      .eq('role', 'professional')
      .eq('video_available', true);

    if (error) {
      console.error('Error fetching video-enabled professionals:', error);
      throw new Error(`Failed to fetch video-enabled professionals: ${error.message}`);
    }

    return data || [];
  }
}

// Create singleton instance
export const videoAvailabilityService = new VideoAvailabilityService();
