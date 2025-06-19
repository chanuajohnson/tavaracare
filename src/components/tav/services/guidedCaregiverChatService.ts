
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
      console.log(`[GuidedChatService] Fetching prompt templates for stage: ${stage}`);
      
      const { data, error } = await supabase
        .from('chat_prompt_templates')
        .select('*')
        .eq('stage', stage)
        .eq('is_active', true)
        .order('order_index');

      if (error) {
        console.error('[GuidedChatService] Error fetching prompt templates:', error);
        return [];
      }

      console.log(`[GuidedChatService] Found ${data?.length || 0} templates for stage ${stage}:`, data);
      return data || [];
    } catch (error) {
      console.error('[GuidedChatService] Error in getPromptTemplates:', error);
      return [];
    }
  }

  // Initialize conversation flow
  async initializeConversationFlow(sessionId: string): Promise<ChatConversationFlow | null> {
    try {
      console.log(`[GuidedChatService] Initializing conversation flow for session: ${sessionId}`);
      
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
        console.error('[GuidedChatService] Error initializing conversation flow:', error);
        return null;
      }

      console.log('[GuidedChatService] Conversation flow initialized:', data);
      return {
        ...data,
        current_stage: data.current_stage as 'introduction' | 'interest_expression' | 'waiting_acceptance' | 'guided_qa'
      };
    } catch (error) {
      console.error('[GuidedChatService] Error in initializeConversationFlow:', error);
      return null;
    }
  }

  // Get conversation flow
  async getConversationFlow(sessionId: string): Promise<ChatConversationFlow | null> {
    try {
      console.log(`[GuidedChatService] Getting conversation flow for session: ${sessionId}`);
      
      const { data, error } = await supabase
        .from('chat_conversation_flows')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('[GuidedChatService] Error fetching conversation flow:', error);
        return null;
      }

      if (!data) {
        console.log(`[GuidedChatService] No conversation flow found for session: ${sessionId}`);
        return null;
      }

      console.log('[GuidedChatService] Found conversation flow:', data);
      return {
        ...data,
        current_stage: data.current_stage as 'introduction' | 'interest_expression' | 'waiting_acceptance' | 'guided_qa'
      };
    } catch (error) {
      console.error('[GuidedChatService] Error in getConversationFlow:', error);
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
      console.log(`[GuidedChatService] Updating conversation stage to ${stage} for session: ${sessionId}`, stageData);
      
      const { error } = await supabase
        .from('chat_conversation_flows')
        .update({
          current_stage: stage,
          stage_data: stageData,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('[GuidedChatService] Error updating conversation stage:', error);
        return false;
      }

      console.log(`[GuidedChatService] Successfully updated conversation stage to ${stage}`);
      return true;
    } catch (error) {
      console.error('[GuidedChatService] Error in updateConversationStage:', error);
      return false;
    }
  }

  // Create caregiver chat request (gateway message)
  async createChatRequest(caregiverId: string, initialMessage: string): Promise<CaregiverChatRequest | null> {
    try {
      console.log(`[GuidedChatService] Creating chat request for caregiver: ${caregiverId}`);
      console.log(`[GuidedChatService] Initial message: "${initialMessage}"`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[GuidedChatService] No authenticated user found for chat request');
        return null;
      }

      console.log(`[GuidedChatService] Creating chat request from family user: ${user.id}`);

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
        console.error('[GuidedChatService] Error creating chat request:', error);
        return null;
      }

      console.log('[GuidedChatService] Chat request created successfully:', data);

      // Create notification for caregiver
      console.log(`[GuidedChatService] Creating notification for caregiver: ${caregiverId}`);
      const notificationCreated = await this.createCaregiverNotification(
        caregiverId,
        'chat_request',
        'New Chat Request',
        `A family is interested in connecting with you: "${initialMessage}"`,
        { chat_request_id: data.id }
      );

      if (notificationCreated) {
        console.log('[GuidedChatService] Caregiver notification created successfully');
      } else {
        console.warn('[GuidedChatService] Failed to create caregiver notification');
      }

      return {
        ...data,
        status: data.status as 'pending' | 'accepted' | 'declined'
      };
    } catch (error) {
      console.error('[GuidedChatService] Error in createChatRequest:', error);
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
      console.log(`[GuidedChatService] Creating notification for caregiver: ${caregiverId}`, { type, title });
      
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
        console.error('[GuidedChatService] Error creating caregiver notification:', error);
        return false;
      }

      console.log('[GuidedChatService] Caregiver notification created successfully');
      return true;
    } catch (error) {
      console.error('[GuidedChatService] Error in createCaregiverNotification:', error);
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
      console.log(`[GuidedChatService] Handling prompt selection in stage: ${currentStage}`);
      console.log(`[GuidedChatService] Prompt text: "${promptText}"`);
      console.log(`[GuidedChatService] Caregiver ID: ${caregiver.id}`);
      
      const flow = await this.getConversationFlow(sessionId);
      if (!flow) {
        console.error('[GuidedChatService] Conversation flow not found for session:', sessionId);
        return { success: false, error: "Conversation flow not found" };
      }

      // Handle stage progression
      let nextStage = currentStage;
      let stageData = { ...flow.stage_data };

      console.log(`[GuidedChatService] Current stage: ${currentStage}, processing...`);

      switch (currentStage) {
        case 'introduction':
          // After introduction, move to interest expression
          nextStage = 'interest_expression';
          stageData.selectedIntroPrompt = promptText;
          console.log('[GuidedChatService] Moving from introduction to interest_expression');
          break;
        
        case 'interest_expression':
          console.log('[GuidedChatService] CRITICAL: Processing interest expression - this should create chat request!');
          console.log(`[GuidedChatService] About to create chat request for caregiver: ${caregiver.id}`);
          
          // Create chat request and move to waiting
          const chatRequest = await this.createChatRequest(caregiver.id, promptText);
          if (!chatRequest) {
            console.error('[GuidedChatService] FAILED TO CREATE CHAT REQUEST!');
            return { success: false, error: "Failed to create chat request" };
          }
          
          console.log('[GuidedChatService] SUCCESS: Chat request created, moving to waiting_acceptance');
          nextStage = 'waiting_acceptance';
          stageData.chatRequestId = chatRequest.id;
          break;
        
        case 'guided_qa':
          // Continue in guided Q&A
          stageData.lastQuestion = promptText;
          console.log('[GuidedChatService] Continuing in guided_qa stage');
          break;

        default:
          console.warn(`[GuidedChatService] Unknown stage: ${currentStage}`);
      }

      // Update conversation stage
      console.log(`[GuidedChatService] Updating conversation stage from ${currentStage} to ${nextStage}`);
      const stageUpdated = await this.updateConversationStage(sessionId, nextStage as any, stageData);
      
      if (!stageUpdated) {
        console.error('[GuidedChatService] Failed to update conversation stage');
        return { success: false, error: "Failed to update conversation stage" };
      }

      // Get TAV response
      console.log('[GuidedChatService] Getting TAV response for stage:', currentStage);
      const tavResponse = await this.getTavResponse(promptText, caregiver, currentStage, stageData);

      console.log('[GuidedChatService] Prompt selection handled successfully');
      return { 
        success: true, 
        response: tavResponse,
        nextStage 
      };
    } catch (error) {
      console.error('[GuidedChatService] Error handling prompt selection:', error);
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
    console.log(`[GuidedChatService] Generating TAV response for stage: ${stage}`);
    
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
      console.log('[GuidedChatService] TAV response generated successfully');
      return response || "💙 I'm here to help you connect with this amazing caregiver. What would you like to know next?";
    } catch (error) {
      console.error('[GuidedChatService] Error getting TAV response:', error);
      return "💙 I'm here to help you connect with this caregiver. Let me know what you'd like to learn about them!";
    }
  }

  // Check chat request status
  async getChatRequestStatus(caregiverId: string): Promise<CaregiverChatRequest | null> {
    try {
      console.log(`[GuidedChatService] Checking chat request status for caregiver: ${caregiverId}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[GuidedChatService] No authenticated user for status check');
        return null;
      }

      const { data, error } = await supabase
        .from('caregiver_chat_requests')
        .select('*')
        .eq('family_user_id', user.id)
        .eq('caregiver_id', caregiverId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[GuidedChatService] Error fetching chat request status:', error);
        return null;
      }

      if (!data) {
        console.log(`[GuidedChatService] No chat request found for caregiver: ${caregiverId}`);
        return null;
      }

      console.log('[GuidedChatService] Chat request status:', data);
      return {
        ...data,
        status: data.status as 'pending' | 'accepted' | 'declined'
      };
    } catch (error) {
      console.error('[GuidedChatService] Error in getChatRequestStatus:', error);
      return null;
    }
  }
}
