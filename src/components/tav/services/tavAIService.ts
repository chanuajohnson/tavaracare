
import { supabase } from '@/integrations/supabase/client';

export interface TAVMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

export interface TAVConversationContext {
  currentPage: string;
  currentForm?: string;
  formFields?: Record<string, any>;
  userRole?: string;
  sessionId: string;
  caregiverContext?: any; // Added for caregiver chat support
}

export class TAVAIService {
  private static instance: TAVAIService;
  
  static getInstance(): TAVAIService {
    if (!TAVAIService.instance) {
      TAVAIService.instance = new TAVAIService();
    }
    return TAVAIService.instance;
  }

  async sendMessage(
    message: string, 
    context: TAVConversationContext,
    conversationHistory: TAVMessage[] = []
  ): Promise<string> {
    try {
      // Create system prompt for TAV
      const systemPrompt = this.createTAVSystemPrompt(context);
      
      // Format conversation history for AI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Use enhanced TAV service for better responses
      const { data, error } = await supabase.functions.invoke('tav-chat-enhanced', {
        body: {
          message,
          context,
          conversationHistory,
          enableStreaming: false,
          enableMemory: true
        }
      });

      if (error) {
        console.error('TAV AI Service error:', error);
        return this.getFallbackResponse(context);
      }

      return data.message || this.getFallbackResponse(context);
    } catch (error) {
      console.error('TAV AI Service error:', error);
      return this.getFallbackResponse(context);
    }
  }

  private createTAVSystemPrompt(context: TAVConversationContext): string {
    let prompt = `You are TAV, Tavara's friendly virtual care coordinator. You help users navigate forms and the Tavara platform with warmth and expertise.

Current context:
- Page: ${context.currentPage}
- User role: ${context.userRole || 'guest'}`;

    if (context.currentForm) {
      prompt += `\n- Current form: ${context.currentForm}`;
    }

    if (context.formFields && Object.keys(context.formFields).length > 0) {
      prompt += `\n- Available form fields: ${Object.keys(context.formFields).join(', ')}`;
    }

    // Add caregiver chat specific context
    if (context.caregiverContext) {
      prompt += `\n\nCAREGIVER CHAT MODE - SPECIAL INSTRUCTIONS:
- You are moderating a conversation between a family (FM) and professional caregiver (PC)
- NEVER share contact information (phone, email, address, social media)
- Keep conversations focused on professional caregiving topics only
- Prevent meeting arrangements or direct contact sharing
- Be warm but maintain professional boundaries
- Help families learn about caregiver experience, approach, and availability
- If users try to share contact info, redirect them to professional topics`;
    }

    prompt += `\n\nGuidelines:
- Keep responses concise (1-2 sentences)
- Be warm and helpful, like a caring Trinidad & Tobago coordinator
- Focus on helping with the current form or page
- Offer specific, actionable guidance
- Use emojis sparingly: 💙 🤝 💪
- If on a form page, offer to help fill it out step by step
- If not on a form, guide them to relevant actions`;

    return prompt;
  }

  private getFallbackResponse(context: TAVConversationContext): string {
    if (context.caregiverContext) {
      return "💙 I'm here to help facilitate your conversation with this caregiver. What would you like to know about their professional experience?";
    }
    
    if (context.currentForm) {
      return "💙 I'm here to help you with this form. What would you like assistance with?";
    }
    
    switch (context.currentPage) {
      case '/':
        return "💙 Welcome to Tavara! I can help you get started with finding care or offering your services.";
      case '/auth':
        return "💙 I can help you with login or registration. What brings you to Tavara today?";
      default:
        return "💙 I'm here to help you navigate Tavara. How can I assist you today?";
    }
  }
}
