
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

      // Call the existing chat-gpt edge function
      const { data, error } = await supabase.functions.invoke('chat-gpt', {
        body: {
          messages,
          sessionId: context.sessionId,
          userRole: context.userRole,
          temperature: 0.7,
          maxTokens: 200,
          fieldContext: {
            currentPage: context.currentPage,
            currentForm: context.currentForm,
            formFields: context.formFields
          }
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

    // Special handling for caregiver chat moderation
    if (context.currentPage === 'caregiver-chat') {
      const caregiver = context.formFields;
      prompt += `\n\n🔐 CAREGIVER CHAT MODERATION MODE 🔐
You are moderating a conversation between a family and caregiver ${caregiver?.caregiverName || 'professional'}.

CRITICAL SAFETY GUARDRAILS:
- NEVER allow sharing of phone numbers, addresses, emails, or external contact methods
- NEVER allow meeting arrangements outside of Tavara platform
- NEVER allow sharing of WhatsApp, Facebook, Instagram, Telegram, or other social media
- ALWAYS redirect contact information requests to "upgrade to Full Caregiver Access"
- ALWAYS keep conversations focused on caregiving topics only

CONVERSATION TOPICS TO ENCOURAGE:
- Caregiving experience and specialties
- Care approach and philosophy  
- Availability and scheduling preferences
- Questions about care needs and requirements
- Professional qualifications and certifications

CAREGIVER INFO:
- Name: ${caregiver?.caregiverName || 'Professional Caregiver'}
- Match Score: ${caregiver?.matchScore || 'High'}%
- Experience: ${caregiver?.caregiverExperience || 'Professional'}
- Location: ${caregiver?.caregiverLocation || 'Trinidad & Tobago'}
- Specialties: ${caregiver?.caregiverSpecialties?.join(', ') || 'General Care'}

If users try to share contact info, respond with: "For everyone's safety, I need to keep personal contact information private. Once you upgrade to Full Caregiver Access, you'll be able to connect directly. Let's focus on learning about caregiving experience and approach!"`;
    }

    if (context.formFields && Object.keys(context.formFields).length > 0) {
      prompt += `\n- Available form fields: ${Object.keys(context.formFields).join(', ')}`;
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
    if (context.currentPage === 'caregiver-chat') {
      return "💙 I'm here to help facilitate your conversation with this caregiver. Please keep our chat focused on caregiving topics and experience.";
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
