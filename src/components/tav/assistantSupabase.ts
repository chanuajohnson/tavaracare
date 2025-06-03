
import { supabase } from '@/lib/supabase';
import { AssistantNudge } from './types';

export const assistantSupabase = {
  async getNudgesForUser(userId: string): Promise<AssistantNudge[]> {
    try {
      const { data, error } = await supabase
        .from('assistant_nudges')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our AssistantNudge interface
      return (data || []).map(item => ({
        ...item,
        context: typeof item.context === 'object' && item.context !== null 
          ? item.context as { [key: string]: any; role?: string; progress_stage?: string; action_type?: string; }
          : {}
      }));
    } catch (error) {
      console.error('Error fetching nudges:', error);
      return [];
    }
  },

  async markNudgeAsSeen(nudgeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('assistant_nudges')
        .update({ status: 'seen', updated_at: new Date().toISOString() })
        .eq('id', nudgeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking nudge as seen:', error);
    }
  },

  async createAutoNudge(userId: string, message: string, context: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('assistant_nudges')
        .insert({
          user_id: userId,
          message,
          context,
          sender: 'TAV',
          status: 'sent'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating auto nudge:', error);
    }
  }
};
