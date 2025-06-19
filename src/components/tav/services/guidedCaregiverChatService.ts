
import { supabase } from '@/integrations/supabase/client';
import { TAVAIService } from './tavAIService';

export interface CaregiverChatRequest {
  id: string;
  family_user_id: string;
  caregiver_id: string;
  initial_message: string;
  status: 'pending' | 'accepted' | 'declined';
  accepted_at?: string;
  declined_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatConversationFlow {
  id: string;
  session_id: string;
  current_stage: 'introduction' | 'interest_expression' | 'waiting_acceptance' | 'guided_qa';
  stage_data: any;
  created_at: string;
  updated_at: string;
}

export interface ChatPromptTemplate {
  id: string;
  stage: string;
  category: string;
  prompt_text: string;
  order_index: number;
  is_active: boolean;
  context_requirements: any;
}

export interface CaregiverNotification {
  id: string;
  caregiver_id: string;
  notification_type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  read_at?: string;
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

export class GuidedCaregiverChatService {
  private tavService: TAVAIService;

  constructor() {
    this.tavService = TAVAIService.getInstance();
  }

  // Get prompt templates for a specific stage
  async getPromptTemplates(stage: string): Promise<ChatPromptTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('chat_prompt_templates')
        .select('*')
        .eq('stage', stage)
        .eq('is_active', true)
        .order('order_index');

      if (error) {
        console.error('Error fetching prompt templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPromptTemplates:', error);
      return [];
    }
  }

  // Initialize conversation flow
  async initializeConversationFlow(sessionId: string): Promise<ChatConversationFlow | null> {
    try {
      const { data, error } = await supabase
        .from('chat_conversation_flows')
        .insert({
          session_id: sessionId,
          current_stage: 'introduction',
          stage_data: {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error initializing conversation flow:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in initializeConversationFlow:', error);
      return null;
    }
  }

  // Get conversation flow
  async getConversationFlow(sessionId: string): Promise<ChatConversationFlow | null> {
    try {
      const { data, error } = await supabase
        .from('chat_conversation_flows')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching conversation flow:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getConversationFlow:', error);
      return null;
    }
  }

  // Update conversation stage
  async updateConversationStage(
    sessionId: string, 
    stage: 'introduction' | 'interest_expression' | 'waiting_acceptance' | 'guided_qa',
    stageData: any = {}
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversation_flows')
        .update({
          current_stage: stage,
          stage_data: stageData,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error updating conversation stage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateConversationStage:', error);
      return false;
    }
  }

  // Create caregiver chat request (gateway message)
  async createChatRequest(caregiverId: string, initialMessage: string): Promise<CaregiverChatRequest | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('caregiver_chat_requests')
        .insert({
          family_user_id: user.id,
          caregiver_id: caregiverId,
          initial_message: initialMessage,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat request:', error);
        return null;
      }

      // Create notification for caregiver
      await this.createCaregiverNotification(
        caregiverId,
        'chat_request',
        'New Chat Request',
        `A family is interested in connecting with you: "${initialMessage}"`,
        { chat_request_id: data.id }
      );

      return data;
    } catch (error) {
      console.error('Error in createChatRequest:', error);
      return null;
    }
  }

  // Create caregiver notification
  async createCaregiverNotification(
    caregiverId: string,
    type: string,
    title: string,
    message: string,
    data: any = {}
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('caregiver_notifications')
        .insert({
          caregiver_id: caregiverId,
          notification_type: type,
          title,
          message,
          data
        });

      if (error) {
        console.error('Error creating caregiver notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createCaregiverNotification:', error);
      return false;
    }
  }

  // Handle prompt selection and generate TAV response
  async handlePromptSelection(
    sessionId: string,
    promptText: string,
    caregiver: Caregiver,
    currentStage: string
  ): Promise<{ success: boolean; response?: string; error?: string; nextStage?: string }> {
    try {
      const flow = await this.getConversationFlow(sessionId);
      if (!flow) {
        return { success: false, error: "Conversation flow not found" };
      }

      // Handle stage progression
      let nextStage = currentStage;
      let stageData = { ...flow.stage_data };

      switch (currentStage) {
        case 'introduction':
          // After introduction, move to interest expression
          nextStage = 'interest_expression';
          stageData.selectedIntroPrompt = promptText;
          break;
        
        case 'interest_expression':
          // Create chat request and move to waiting
          const chatRequest = await this.createChatRequest(caregiver.id, promptText);
          if (!chatRequest) {
            return { success: false, error: "Failed to create chat request" };
          }
          nextStage = 'waiting_acceptance';
          stageData.chatRequestId = chatRequest.id;
          break;
        
        case 'guided_qa':
          // Continue in guided Q&A
          stageData.lastQuestion = promptText;
          break;
      }

      // Update conversation stage
      await this.updateConversationStage(sessionId, nextStage as any, stageData);

      // Get TAV response
      const tavResponse = await this.getTavResponse(promptText, caregiver, currentStage, stageData);

      return { 
        success: true, 
        response: tavResponse,
        nextStage 
      };
    } catch (error) {
      console.error('Error handling prompt selection:', error);
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }

  // Get TAV moderated response
  private async getTavResponse(
    userPrompt: string,
    caregiver: Caregiver,
    stage: string,
    stageData: any
  ): Promise<string> {
    let systemPrompt = '';

    switch (stage) {
      case 'introduction':
        systemPrompt = `You are TAV, Tavara's friendly care coordinator. The family has selected: "${userPrompt}"

Help them understand what to expect next. This is the introduction stage where they're getting to know the caregiver.

Current Caregiver Info:
- Professional Caregiver from ${caregiver.location}
- ${caregiver.years_of_experience} experience
- Specializes in: ${caregiver.care_types?.join(', ') || 'General Care'}
- ${caregiver.match_score}% compatibility match

Provide encouraging guidance about connecting with this caregiver. Keep it warm and supportive.`;
        break;

      case 'interest_expression':
        systemPrompt = `You are TAV, Tavara's friendly care coordinator. The family wants to connect: "${userPrompt}"

This is the gateway moment! Explain that you're now reaching out to the caregiver and they'll be notified. Set expectations for response time and what happens next.

Be excited and supportive - this is a big step for the family!`;
        break;

      case 'waiting_acceptance':
        systemPrompt = `You are TAV, Tavara's friendly care coordinator. The family is waiting for the caregiver to respond to their interest.

Provide reassuring updates about the process. Explain that caregivers typically respond within a few hours. Keep them engaged and positive.`;
        break;

      case 'guided_qa':
        systemPrompt = `You are TAV, Tavara's friendly care coordinator. The family asked: "${userPrompt}"

Provide a thoughtful response about this caregiver based on their profile. Create realistic but helpful responses that would help the family understand if this is a good match.

Focus on professional caregiving topics only. Be encouraging and informative.`;
        break;

      default:
        systemPrompt = `You are TAV, Tavara's friendly care coordinator helping facilitate a conversation between a family and a professional caregiver.`;
    }

    try {
      const context = {
        currentPage: '/caregiver-chat',
        sessionId: `guided-chat-${Date.now()}`,
        userRole: 'family',
        caregiverContext: caregiver,
        conversationStage: stage
      };

      const response = await this.tavService.sendMessage(userPrompt, context, []);
      return response || "💙 I'm here to help you connect with this amazing caregiver. What would you like to know next?";
    } catch (error) {
      console.error('Error getting TAV response:', error);
      return "💙 I'm here to help you connect with this caregiver. Let me know what you'd like to learn about them!";
    }
  }

  // Check chat request status
  async getChatRequestStatus(caregiverId: string): Promise<CaregiverChatRequest | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('caregiver_chat_requests')
        .select('*')
        .eq('family_user_id', user.id)
        .eq('caregiver_id', caregiverId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching chat request status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getChatRequestStatus:', error);
      return null;
    }
  }
}
