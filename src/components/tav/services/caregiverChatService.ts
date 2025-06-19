
import { supabase } from '@/integrations/supabase/client';
import { TAVAIService } from './tavAIService';

export interface CaregiverChatSession {
  id: string;
  family_user_id: string;
  caregiver_id: string;
  session_date: string;
  messages_sent: number;
  max_daily_messages: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaregiverChatMessage {
  id: string;
  session_id: string;
  content: string;
  is_user: boolean;
  is_tav_moderated: boolean;
  message_type: 'chat' | 'system' | 'warning' | 'upsell';
  created_at: string;
}

export interface Caregiver {
  id: string;
  full_name: string;
  location: string | null;
  care_types: string[] | null;
  years_of_experience: string | null;
  match_score: number;
  is_premium: boolean;
  shift_compatibility_score?: number;
  match_explanation?: string;
}

export class CaregiverChatService {
  private tavService: TAVAIService;

  constructor() {
    this.tavService = TAVAIService.getInstance();
  }

  // Check if user can send more messages today
  async canSendMessage(caregiverId: string): Promise<{ canSend: boolean; remaining: number; session?: CaregiverChatSession }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { canSend: false, remaining: 0 };

      const today = new Date().toISOString().split('T')[0];
      
      let { data: session, error } = await supabase
        .from('caregiver_chat_sessions')
        .select('*')
        .eq('family_user_id', user.id)
        .eq('caregiver_id', caregiverId)
        .eq('session_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking message limits:', error);
        return { canSend: false, remaining: 0 };
      }

      // Create session if it doesn't exist
      if (!session) {
        const { data: newSession, error: createError } = await supabase
          .from('caregiver_chat_sessions')
          .insert({
            family_user_id: user.id,
            caregiver_id: caregiverId,
            session_date: today,
            messages_sent: 0,
            max_daily_messages: 3,
            is_premium: false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating session:', createError);
          return { canSend: false, remaining: 0 };
        }
        session = newSession;
      }

      const canSend = session.is_premium || session.messages_sent < session.max_daily_messages;
      const remaining = session.is_premium ? 999 : Math.max(0, session.max_daily_messages - session.messages_sent);

      return { canSend, remaining, session };
    } catch (error) {
      console.error('Error in canSendMessage:', error);
      return { canSend: false, remaining: 0 };
    }
  }

  // Get chat messages for a session
  async getChatMessages(caregiverId: string): Promise<CaregiverChatMessage[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data: session } = await supabase
        .from('caregiver_chat_sessions')
        .select('id')
        .eq('family_user_id', user.id)
        .eq('caregiver_id', caregiverId)
        .eq('session_date', today)
        .maybeSingle();

      if (!session) return [];

      const { data: messages, error } = await supabase
        .from('caregiver_chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return messages || [];
    } catch (error) {
      console.error('Error in getChatMessages:', error);
      return [];
    }
  }

  // Send a message through TAV moderation
  async sendMessage(caregiverId: string, message: string, caregiver: Caregiver): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const { canSend, session } = await this.canSendMessage(caregiverId);
      
      if (!canSend) {
        return { 
          success: false, 
          error: "You've reached your daily message limit. Upgrade to Premium for unlimited messaging!" 
        };
      }

      if (!session) {
        return { success: false, error: "Unable to create chat session" };
      }

      // Check for inappropriate content
      const filteredMessage = this.filterMessage(message);
      if (filteredMessage !== message) {
        return { 
          success: false, 
          error: "💙 For your safety, I can't share contact information. Let's keep our conversation focused on caregiving topics!" 
        };
      }

      // Save user message
      await supabase
        .from('caregiver_chat_messages')
        .insert({
          session_id: session.id,
          content: message,
          is_user: true,
          is_tav_moderated: true,
          message_type: 'chat'
        });

      // Get TAV response
      const tavResponse = await this.getTavResponse(message, caregiver, session.messages_sent + 1);

      // Save TAV response
      await supabase
        .from('caregiver_chat_messages')
        .insert({
          session_id: session.id,
          content: tavResponse,
          is_user: false,
          is_tav_moderated: true,
          message_type: 'chat'
        });

      // Update message count
      await supabase
        .from('caregiver_chat_sessions')
        .update({ 
          messages_sent: session.messages_sent + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      return { success: true, response: tavResponse };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }

  // Filter messages for inappropriate content
  private filterMessage(message: string): string {
    const contactPatterns = [
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails
      /\b(?:whatsapp|telegram|instagram|facebook|snapchat|twitter)\b/i, // Social media
      /\b(?:meet|address|location|come over|visit|phone|call|text)\b/i, // Meeting arrangements
    ];

    for (const pattern of contactPatterns) {
      if (pattern.test(message)) {
        return "[FILTERED_CONTENT]";
      }
    }

    return message;
  }

  // Get TAV moderated response
  private async getTavResponse(userMessage: string, caregiver: Caregiver, messageNumber: number): Promise<string> {
    const systemPrompt = `You are TAV, Tavara's friendly care coordinator. You're moderating a conversation between a family (FM) and a professional caregiver (PC) to help them get to know each other professionally.

STRICT GUIDELINES:
- Never share contact information (phone, email, address, social media)
- Keep conversations focused on professional caregiving topics only
- Prevent meeting arrangements or direct contact sharing
- Be warm but maintain professional boundaries
- This is message ${messageNumber}/3 for free users

Current Caregiver Info:
- Professional Caregiver (PC) from ${caregiver.location}
- ${caregiver.years_of_experience} experience
- Specializes in: ${caregiver.care_types?.join(', ') || 'General Care'}
- ${caregiver.match_score}% compatibility match
${caregiver.match_explanation ? `- ${caregiver.match_explanation}` : ''}

Family's message: "${userMessage}"

Provide a helpful response that facilitates professional discussion about caregiving while maintaining safety guardrails. Be warm and encouraging.`;

    try {
      const context = {
        currentPage: '/caregiver-chat',
        sessionId: `caregiver-${caregiver.id}`,
        userRole: 'family',
        caregiverContext: caregiver
      };

      const response = await this.tavService.sendMessage(userMessage, context, []);
      return response || "💙 I'm here to help facilitate your conversation. What would you like to know about this caregiver's professional experience?";
    } catch (error) {
      console.error('Error getting TAV response:', error);
      return "💙 I'm here to help you learn more about this caregiver's professional background. What specific questions do you have about their experience?";
    }
  }
}
