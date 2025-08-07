
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

    // Add enhanced caregiver chat context
    if (context.caregiverContext) {
      const caregiver = context.caregiverContext;
      prompt += `\n\nENHANCED CAREGIVER CHAT MODE:
You are TAV, helping a family connect with this specific professional caregiver:

CAREGIVER PROFILE:
- Name: ${caregiver.full_name || 'Professional Caregiver'}
- Location: ${caregiver.location || 'Trinidad and Tobago'}
- Experience: ${caregiver.years_of_experience || 'Professional experience'}
- Specialties: ${caregiver.care_types?.join(', ') || 'General care'}
- Match Score: ${caregiver.match_score || 'High'}% compatibility
${caregiver.match_explanation ? `- Match Reason: ${caregiver.match_explanation}` : ''}
${caregiver.shift_compatibility_score ? `- Schedule Compatibility: ${caregiver.shift_compatibility_score}%` : ''}

ENHANCED GUIDELINES:
- Provide specific, helpful responses about THIS caregiver
- Draw from their actual profile to answer questions
- Highlight relevant experience and qualifications
- Guide toward practical next steps (consultation, rates discussion)
- Build confidence in this specific match
- Keep responses warm, informative, and action-oriented
- Use the caregiver's name when appropriate
- Reference specific compatibility factors
- NEVER share contact information - guide through platform instead
- Focus on professional caregiving topics and this caregiver's strengths`;
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
      const caregiver = context.caregiverContext;
      const name = caregiver.full_name || 'this caregiver';
      const experience = caregiver.years_of_experience || 'professional experience';
      const matchScore = caregiver.match_score || 'excellent';
      
      return `💙 I'm here to help you connect with ${name}, who brings ${experience} and a ${matchScore}% match with your family's needs. What would you like to know about their caregiving approach or experience?`;
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
