
import { supabase } from '@/lib/supabase';

export interface FamilyChatRequest {
  id: string;
  professional_id: string;
  family_user_id: string;
  initial_message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  declined_at?: string;
}

export interface FamilyChatSession {
  id: string;
  professional_id: string;
  family_user_id: string;
  session_date: string;
  messages_sent: number;
  max_daily_messages: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyChatMessage {
  id: string;
  session_id: string;
  content: string;
  is_user: boolean;
  message_type: string;
  is_tav_moderated: boolean;
  created_at: string;
}

export class ProfessionalFamilyChatService {
  // Send initial chat request from professional to family
  static async sendChatRequest(familyUserId: string, initialMessage: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('family_chat_requests')
        .insert({
          professional_id: user.id,
          family_user_id: familyUserId,
          initial_message: initialMessage,
          status: 'pending'
        });

      if (error) {
        console.error('Error sending chat request:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in sendChatRequest:', error);
      return { success: false, error: 'Failed to send chat request' };
    }
  }

  // Get chat requests sent by current professional
  static async getProfessionalChatRequests(): Promise<FamilyChatRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('family_chat_requests')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching professional chat requests:', error);
        return [];
      }

      return (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'accepted' | 'declined'
      }));
    } catch (error) {
      console.error('Error in getProfessionalChatRequests:', error);
      return [];
    }
  }

  // Get chat requests received by current family
  static async getFamilyChatRequests(): Promise<FamilyChatRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('family_chat_requests')
        .select('*')
        .eq('family_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching family chat requests:', error);
        return [];
      }

      return (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'accepted' | 'declined'
      }));
    } catch (error) {
      console.error('Error in getFamilyChatRequests:', error);
      return [];
    }
  }

  // Accept chat request (family action)
  static async acceptChatRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('family_chat_requests')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error accepting chat request:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in acceptChatRequest:', error);
      return { success: false, error: 'Failed to accept chat request' };
    }
  }

  // Decline chat request (family action)
  static async declineChatRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('family_chat_requests')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error declining chat request:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in declineChatRequest:', error);
      return { success: false, error: 'Failed to decline chat request' };
    }
  }

  // Create or get chat session
  static async getOrCreateChatSession(familyUserId: string): Promise<FamilyChatSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];

      // Check if session exists for today
      const { data: existingSession, error: fetchError } = await supabase
        .from('family_chat_sessions')
        .select('*')
        .eq('professional_id', user.id)
        .eq('family_user_id', familyUserId)
        .eq('session_date', today)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching chat session:', fetchError);
        return null;
      }

      if (existingSession) {
        return existingSession;
      }

      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('family_chat_sessions')
        .insert({
          professional_id: user.id,
          family_user_id: familyUserId,
          session_date: today,
          messages_sent: 0,
          max_daily_messages: 3,
          is_premium: false
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating chat session:', createError);
        return null;
      }

      return newSession;
    } catch (error) {
      console.error('Error in getOrCreateChatSession:', error);
      return null;
    }
  }

  // Send message in chat session
  static async sendMessage(sessionId: string, content: string, isUser: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('family_chat_messages')
        .insert({
          session_id: sessionId,
          content,
          is_user: isUser,
          message_type: 'chat',
          is_tav_moderated: true
        });

      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
      }

      // Update message count if it's a user message
      if (isUser) {
        // First get the current session
        const { data: session, error: fetchError } = await supabase
          .from('family_chat_sessions')
          .select('messages_sent')
          .eq('id', sessionId)
          .single();

        if (fetchError) {
          console.error('Error fetching session for count update:', fetchError);
        } else {
          // Update with incremented value
          const { error: updateError } = await supabase
            .from('family_chat_sessions')
            .update({
              messages_sent: (session.messages_sent || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', sessionId);

          if (updateError) {
            console.error('Error updating message count:', updateError);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }

  // Get messages for a session
  static async getSessionMessages(sessionId: string): Promise<FamilyChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('family_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching session messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSessionMessages:', error);
      return [];
    }
  }
}
