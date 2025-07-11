
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
        id: item.id,
        user_id: item.user_id,
        title: item.title || 'Update Available', // Provide default title if missing
        message: item.message,
        context: typeof item.context === 'object' && item.context !== null
          ? item.context as { [key: string]: any; role?: string; progress_stage?: string; action_type?: string; }
          : {},
        sender: (item.sender === 'Chan' ? 'Chan' : 'TAV') as 'TAV' | 'Chan',
        status: (['sent', 'seen', 'clicked'].includes(item.status) ? item.status : 'sent') as 'sent' | 'seen' | 'clicked',
        created_at: item.created_at,
        updated_at: item.updated_at
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
          title: 'New Update',
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
