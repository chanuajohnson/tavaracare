import { supabase } from '@/integrations/supabase/client';
import { CoreTAVMessage, CoreConversationContext } from '../types/core';

export class CoreTAVService {
  private static instance: CoreTAVService;
  
  static getInstance(): CoreTAVService {
    if (!CoreTAVService.instance) {
      CoreTAVService.instance = new CoreTAVService();
    }
    return CoreTAVService.instance;
  }

  async sendMessage(
    message: string, 
    context: CoreConversationContext,
    conversationHistory: CoreTAVMessage[] = []
  ): Promise<string> {
    try {
      // Create specialized system prompt for standalone TAV
      const systemPrompt = this.createCoreSystemPrompt(context);
      
      console.log('🤖 CoreTAV sending message:', {
        message: message.substring(0, 50) + '...',
        context: context.currentPage,
        demoType: context.demoConfig?.type,
        useCase: context.demoConfig?.useCase
      });

      // Use the enhanced TAV service for better responses
      const { data, error } = await supabase.functions.invoke('tav-chat-enhanced', {
        body: {
          message,
          context: {
            ...context,
            // Override with core-specific context
            assistantMode: 'standalone',
            demoMode: true
          },
          conversationHistory,
          enableStreaming: false,
          enableMemory: false // Demos don't persist memory
        }
      });

      if (error) {
        console.error('❌ CoreTAV Service error:', error);
        return this.getFallbackResponse(context);
      }

      console.log('✅ CoreTAV response received');
      return data?.message || this.getFallbackResponse(context);
    } catch (error) {
      console.error('CoreTAV Service error:', error);
      return this.getFallbackResponse(context);
    }
  }

  private createCoreSystemPrompt(context: CoreConversationContext): string {
    const assistantName = context.branding?.assistantName || 'TAV';
    const companyName = context.branding?.companyName || 'your organization';
    
    let prompt = `You are ${assistantName}, an intelligent conversational assistant that helps users navigate forms and complete processes with ease.

You are currently running in DEMO MODE for potential customers evaluating our chatbot solution.

Current context:
- Page: ${context.currentPage}
- Demo type: ${context.demoConfig?.type || 'interactive'}
- Use case: ${context.demoConfig?.useCase || 'general'}`;

    if (context.currentForm) {
      prompt += `\n- Current form: ${context.currentForm}`;
    }

    if (context.formFields && Object.keys(context.formFields).length > 0) {
      prompt += `\n- Available form fields: ${Object.keys(context.formFields).join(', ')}`;
    }

    // Add demo-specific guidance
    prompt += `\n\nDEMO MODE GUIDELINES:
- This is a demonstration for potential customers
- Show how you can intelligently help with ${context.demoConfig?.useCase || 'form completion'}
- Be helpful, friendly, and showcase your capabilities
- Demonstrate how you can guide users step-by-step through complex forms
- Show contextual awareness and smart suggestions
- If asked about implementation, guide toward the sales process`;

    // Add branding context
    if (context.branding) {
      prompt += `\n\nBRANDING CONTEXT:
- You represent ${companyName}
- Maintain the tone and style appropriate for their brand
- Use their custom welcome message when appropriate: "${context.branding.welcomeMessage}"`;
    }

    prompt += `\n\nCORE CAPABILITIES TO DEMONSTRATE:
- Form field completion assistance
- Step-by-step guidance
- Smart validation and error prevention
- Contextual help and suggestions
- Progress tracking and encouragement
- Natural conversation flow
- Keep responses concise (1-2 sentences)
- Be proactive in offering assistance
- Use emojis sparingly: 💙 🤝 ✨`;

    return prompt;
  }

  private getFallbackResponse(context: CoreConversationContext): string {
    const assistantName = context.branding?.assistantName || 'TAV';
    
    if (context.currentForm) {
      return `💙 I'm ${assistantName}, and I'm here to help you with this form. What would you like assistance with?`;
    }
    
    switch (context.demoConfig?.useCase) {
      case 'registration':
        return `💙 Welcome! I'm ${assistantName}, and I can help make registration quick and easy. What information do you need help with?`;
      case 'interview':
        return `💙 Hi! I'm ${assistantName}. I'm here to guide you through this interview process step by step. Ready to begin?`;
      case 'feedback':
        return `💙 Hello! I'm ${assistantName}, and I can help you provide feedback efficiently. What would you like to share?`;
      case 'support':
        return `💙 Hi there! I'm ${assistantName}, your support assistant. How can I help you today?`;
      default:
        return `💙 Welcome! I'm ${assistantName}, and I'm here to make this process easier for you. How can I assist?`;
    }
  }
}