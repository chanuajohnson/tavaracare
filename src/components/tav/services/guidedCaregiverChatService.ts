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

  // Validate caregiver exists in database - NEW VALIDATION
  private async validateCaregiverExists(caregiverId: string): Promise<boolean> {
    try {
      console.log(`[GuidedChatService] VALIDATION: Checking if caregiver exists: ${caregiverId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', caregiverId)
        .eq('role', 'professional')
        .maybeSingle();

      if (error) {
        console.error('[GuidedChatService] VALIDATION: Error checking caregiver:', error);
        return false;
      }

      const exists = !!data;
      console.log(`[GuidedChatService] VALIDATION: Caregiver exists: ${exists}`, data);
      return exists;
    } catch (error) {
      console.error('[GuidedChatService] VALIDATION: Exception checking caregiver:', error);
      return false;
    }
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

  // Initialize conversation flow with proper UUID session_id
  async initializeConversationFlow(sessionId: string): Promise<ChatConversationFlow | null> {
    try {
      console.log(`[GuidedChatService] Initializing conversation flow for session: ${sessionId}`);
      
      // Ensure sessionId is a valid UUID format - CRITICAL VALIDATION
      if (!sessionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
        console.error('[GuidedChatService] VALIDATION: Invalid UUID format for session_id:', sessionId);
        return null;
      }

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

      console.log('[GuidedChatService] Conversation flow initialized successfully:', data);
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

  // Enhanced createChatRequest with better error handling and logging
  async createChatRequest(caregiverId: string, initialMessage: string): Promise<CaregiverChatRequest | null> {
    try {
      console.log(`[GuidedChatService] *** ENHANCED CHAT REQUEST CREATION ***`);
      console.log(`[GuidedChatService] STEP 1: Starting chat request creation for caregiver: ${caregiverId}`);
      console.log(`[GuidedChatService] STEP 1: Initial message: "${initialMessage}"`);
      
      // Step 1: Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('[GuidedChatService] STEP 1: Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        console.error('[GuidedChatService] STEP 1: No authenticated user found');
        throw new Error('User not authenticated');
      }

      console.log(`[GuidedChatService] STEP 2: Authenticated user found: ${user.id}`);

      // Step 2: Validate caregiver UUID format
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(caregiverId)) {
        console.error('[GuidedChatService] STEP 2: Invalid caregiver UUID format:', caregiverId);
        throw new Error('Invalid caregiver ID format');
      }

      console.log(`[GuidedChatService] STEP 3: UUID format validation passed`);

      // Step 3: Validate caregiver exists in database
      const caregiverExists = await this.validateCaregiverExists(caregiverId);
      if (!caregiverExists) {
        console.error('[GuidedChatService] STEP 3: Caregiver does not exist in database:', caregiverId);
        throw new Error('Caregiver not found in database');
      }

      console.log(`[GuidedChatService] STEP 4: Caregiver existence validated`);

      // Step 4: Check for existing chat request
      console.log(`[GuidedChatService] STEP 4: Checking for existing chat requests...`);
      const { data: existingRequest, error: existingError } = await supabase
        .from('caregiver_chat_requests')
        .select('*')
        .eq('family_user_id', user.id)
        .eq('caregiver_id', caregiverId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        console.error('[GuidedChatService] STEP 4: Error checking existing requests:', existingError);
        throw new Error(`Database error checking existing requests: ${existingError.message}`);
      }

      if (existingRequest) {
        console.log('[GuidedChatService] STEP 4: Found existing chat request:', existingRequest);
        return {
          ...existingRequest,
          status: existingRequest.status as 'pending' | 'accepted' | 'declined'
        };
      }

      console.log('[GuidedChatService] STEP 5: No existing request found, creating new one...');

      // Step 5: Create new chat request with detailed logging
      const insertData = {
        family_user_id: user.id,
        caregiver_id: caregiverId,
        initial_message: initialMessage,
        status: 'pending' as const
      };

      console.log('[GuidedChatService] STEP 5: Insert data prepared:', insertData);

      const { data, error } = await supabase
        .from('caregiver_chat_requests')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[GuidedChatService] STEP 5: Database insert error:', error);
        console.error('[GuidedChatService] STEP 5: Error code:', error.code);
        console.error('[GuidedChatService] STEP 5: Error message:', error.message);
        console.error('[GuidedChatService] STEP 5: Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to create chat request: ${error.message} (Code: ${error.code})`);
      }

      if (!data) {
        console.error('[GuidedChatService] STEP 5: No data returned from insert operation');
        throw new Error('No data returned from chat request creation');
      }

      console.log('[GuidedChatService] STEP 6: Chat request created successfully:', data);

      // Step 6: Create notification for caregiver (with error handling)
      try {
        console.log(`[GuidedChatService] STEP 6: Creating notification for caregiver: ${caregiverId}`);
        const notificationCreated = await this.createCaregiverNotification(
          caregiverId,
          'chat_request',
          'New Chat Request',
          `A family is interested in connecting with you: "${initialMessage}"`,
          { chat_request_id: data.id }
        );

        if (!notificationCreated) {
          console.warn('[GuidedChatService] STEP 6: Failed to create caregiver notification - but request was created');
        } else {
          console.log('[GuidedChatService] STEP 6: Caregiver notification created successfully');
        }
      } catch (notificationError) {
        console.error('[GuidedChatService] STEP 6: Notification creation failed:', notificationError);
        // Don't throw here - chat request was created successfully
      }

      console.log('[GuidedChatService] *** CHAT REQUEST CREATION COMPLETED SUCCESSFULLY ***');
      return {
        ...data,
        status: data.status as 'pending' | 'accepted' | 'declined'
      };
    } catch (error) {
      console.error('[GuidedChatService] *** CHAT REQUEST CREATION FAILED ***');
      console.error('[GuidedChatService] Exception details:', error);
      throw error; // Re-throw to let caller handle
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
      
      // Ensure caregiverId is a valid UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(caregiverId)) {
        console.error('[GuidedChatService] Invalid caregiver UUID format for notification:', caregiverId);
        return false;
      }

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

  // Enhanced handlePromptSelection with better error handling
  async handlePromptSelection(
    sessionId: string,
    promptText: string,
    caregiver: Caregiver,
    currentStage: string
  ): Promise<{ success: boolean; response?: string; error?: string; nextStage?: string; chatRequestId?: string }> {
    try {
      console.log(`[GuidedChatService] *** ENHANCED PROMPT SELECTION HANDLING ***`);
      console.log(`[GuidedChatService] Session ID: ${sessionId}`);
      console.log(`[GuidedChatService] Current stage: ${currentStage}`);
      console.log(`[GuidedChatService] Prompt text: "${promptText}"`);
      console.log(`[GuidedChatService] Caregiver ID: ${caregiver.id}`);
      
      const flow = await this.getConversationFlow(sessionId);
      if (!flow) {
        console.error('[GuidedChatService] Conversation flow not found for session:', sessionId);
        return { success: false, error: "Conversation flow not found" };
      }

      // Handle stage progression with ENHANCED error handling
      let nextStage = currentStage;
      let stageData = { ...flow.stage_data };
      let chatRequestId: string | undefined;

      console.log(`[GuidedChatService] Processing stage transition from: ${currentStage}`);

      switch (currentStage) {
        case 'introduction':
          nextStage = 'interest_expression';
          stageData.selectedIntroPrompt = promptText;
          console.log('[GuidedChatService] ✅ Moving from introduction to interest_expression');
          break;
        
        case 'interest_expression':
          console.log('[GuidedChatService] *** CRITICAL STAGE - INTEREST EXPRESSION ***');
          console.log(`[GuidedChatService] About to create chat request for caregiver: ${caregiver.id}`);
          
          try {
            // CRITICAL FIX - Create chat request with enhanced error handling
            const chatRequest = await this.createChatRequest(caregiver.id, promptText);
            if (!chatRequest) {
              console.error('[GuidedChatService] ❌ CHAT REQUEST CREATION RETURNED NULL!');
              return { success: false, error: "Failed to create chat request. Please try again." };
            }
            
            console.log('[GuidedChatService] ✅ SUCCESS - Chat request created with ID:', chatRequest.id);
            nextStage = 'waiting_acceptance';
            stageData.chatRequestId = chatRequest.id;
            stageData.interestMessage = promptText;
            chatRequestId = chatRequest.id;
          } catch (error) {
            console.error('[GuidedChatService] ❌ Exception creating chat request:', error);
            return { 
              success: false, 
              error: error instanceof Error ? error.message : "Failed to create chat request. Please try again." 
            };
          }
          break;
        
        case 'guided_qa':
          stageData.lastQuestion = promptText;
          console.log('[GuidedChatService] ✅ Continuing in guided_qa stage');
          break;

        default:
          console.warn(`[GuidedChatService] ⚠️ Unknown stage: ${currentStage}`);
      }

      // Update conversation stage with error handling
      console.log(`[GuidedChatService] Updating conversation stage from ${currentStage} to ${nextStage}`);
      const stageUpdated = await this.updateConversationStage(sessionId, nextStage as any, stageData);
      
      if (!stageUpdated) {
        console.error('[GuidedChatService] ❌ Failed to update conversation stage');
        return { success: false, error: "Failed to update conversation stage" };
      }

      // Get TAV response
      console.log('[GuidedChatService] Getting TAV response for stage:', currentStage);
      const tavResponse = await this.getTavResponse(promptText, caregiver, currentStage, stageData);

      console.log('[GuidedChatService] ✅ Prompt selection handled successfully');
      console.log(`[GuidedChatService] Next stage: ${nextStage}`);
      
      return { 
        success: true, 
        response: tavResponse,
        nextStage,
        chatRequestId
      };
    } catch (error) {
      console.error('[GuidedChatService] ❌ Exception handling prompt selection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Something went wrong. Please try again." 
      };
    }
  }

  // Get TAV moderated response with enhanced context and actionable guidance
  private async getTavResponse(
    userPrompt: string,
    caregiver: Caregiver,
    stage: string,
    stageData: any
  ): Promise<string> {
    console.log(`[GuidedChatService] Generating enhanced TAV response for stage: ${stage}`);
    
    // Build comprehensive caregiver context
    const caregiverInfo = this.buildCaregiverContext(caregiver);
    let systemPrompt = '';

    switch (stage) {
      case 'introduction':
        systemPrompt = `You are TAV, Tavara's friendly care coordinator helping families connect with professional caregivers. The family has selected: "${userPrompt}"

CAREGIVER CONTEXT:
${caregiverInfo}

TASK: Provide a warm, informative response that:
1. Acknowledges their choice and builds excitement
2. Highlights why this caregiver is well-matched for their needs
3. Mentions specific qualifications or experience relevant to their care needs
4. Explains what happens next (they can ask questions or express interest)
5. Keep it conversational and encouraging - you're their care coordinator

EXAMPLE APPROACH:
"💙 Excellent choice! [Caregiver name] looks like a wonderful match for your family. With [specific experience/qualification], they bring exactly the expertise you're looking for. I can see why our system matched you at [X]% - [specific reason]. 

Would you like to learn more about their approach to [relevant care type], or are you ready to express your interest in connecting?"

Be specific, helpful, and focus on building confidence in this match.`;
        break;

      case 'interest_expression':
        systemPrompt = `You are TAV, Tavara's friendly care coordinator. The family wants to connect with this caregiver: "${userPrompt}"

CAREGIVER CONTEXT:
${caregiverInfo}

TASK: This is the pivotal moment! Create excitement and set clear expectations:
1. Celebrate their decision to connect
2. Mention specific reasons why this is a great choice based on the caregiver's profile
3. Explain the next steps clearly (notification sent, typical response time)
4. Set realistic expectations (caregivers typically respond within 2-6 hours)
5. Keep them engaged and confident

EXAMPLE APPROACH:
"🎉 Wonderful news! I'm immediately notifying [Caregiver name] about your interest. Given their [specific qualification/experience] and your family's needs, this could be an excellent match!

I've sent them your message along with your care requirements. Professional caregivers on Tavara typically respond within 2-6 hours, often sooner. They'll review your needs and let us know if they're available to help.

I have a good feeling about this connection - [specific reason based on match]!"

Be enthusiastic and specific about why this match makes sense.`;
        break;

      case 'waiting_acceptance':
        systemPrompt = `You are TAV, Tavara's friendly care coordinator. The family is waiting for the caregiver to respond.

CAREGIVER CONTEXT:
${caregiverInfo}

TASK: Provide reassuring, specific updates:
1. Remind them of the caregiver's qualifications while they wait
2. Set realistic expectations about response times
3. Keep them engaged with relevant information about this specific caregiver
4. Maintain confidence in the match quality

Focus on this specific caregiver's strengths and why they're worth waiting for.`;
        break;

      case 'guided_qa':
        systemPrompt = `You are TAV, Tavara's friendly care coordinator facilitating a conversation between this family and professional caregiver. The family asked: "${userPrompt}"

CAREGIVER CONTEXT:
${caregiverInfo}

TASK: Provide specific, helpful responses about this caregiver:
1. Draw from their actual profile information to answer questions
2. Highlight relevant experience, certifications, or specialties
3. Mention specific compatibility factors from the match score
4. Guide toward practical next steps (scheduling consultation, discussing rates, etc.)
5. Keep responses informative but encouraging

RESPONSE APPROACH:
- If asked about experience: Reference their specific years and specialties
- If asked about availability: Mention their schedule preferences if available
- If asked about rates: Reference their pricing if available, or guide to discussion
- If asked about approach: Draw from their specialties and experience level
- If asked about qualifications: Mention specific certifications or training

Always tie responses back to how this caregiver specifically fits their family's needs. Be the knowledgeable coordinator who knows both parties well.`;
        break;

      default:
        systemPrompt = `You are TAV, Tavara's friendly care coordinator helping facilitate a meaningful conversation between a family and professional caregiver.

CAREGIVER CONTEXT:
${caregiverInfo}

Provide helpful, specific guidance based on the caregiver's actual profile and the family's needs.`;
    }

    try {
      const context = {
        currentPage: '/caregiver-chat',
        sessionId: `guided-chat-${Date.now()}`,
        userRole: 'family',
        caregiverContext: {
          ...caregiver,
          fullProfile: caregiverInfo,
          matchDetails: {
            score: caregiver.match_score,
            explanation: caregiver.match_explanation,
            compatibility: caregiver.shift_compatibility_score
          }
        },
        conversationStage: stage,
        stageData
      };

      const response = await this.tavService.sendMessage(systemPrompt + "\n\nUser message: " + userPrompt, context, []);
      console.log('[GuidedChatService] Enhanced TAV response generated successfully');
      return response || this.getFallbackResponse(stage, caregiver);
    } catch (error) {
      console.error('[GuidedChatService] Error getting TAV response:', error);
      return this.getFallbackResponse(stage, caregiver);
    }
  }

  // Build comprehensive caregiver context for enhanced responses
  private buildCaregiverContext(caregiver: any): string {
    const parts = [];
    
    parts.push(`👤 Name: ${caregiver.full_name}`);
    parts.push(`📍 Location: ${caregiver.location || 'Trinidad and Tobago'}`);
    parts.push(`⭐ Match Score: ${caregiver.match_score}% compatibility`);
    
    if (caregiver.years_of_experience) {
      parts.push(`🎓 Experience: ${caregiver.years_of_experience}`);
    }
    
    if (caregiver.professional_type) {
      parts.push(`👨‍⚕️ Professional Type: ${caregiver.professional_type}`);
    }
    
    if (caregiver.care_types && caregiver.care_types.length > 0) {
      parts.push(`🔧 Care Specialties: ${caregiver.care_types.join(', ')}`);
    }
    
    if (caregiver.specialized_care && caregiver.specialized_care.length > 0) {
      parts.push(`🏥 Specialized Care: ${caregiver.specialized_care.join(', ')}`);
    }
    
    if (caregiver.certifications && caregiver.certifications.length > 0) {
      parts.push(`📜 Certifications: ${caregiver.certifications.join(', ')}`);
    }
    
    if (caregiver.hourly_rate) {
      parts.push(`💰 Hourly Rate: $${caregiver.hourly_rate}`);
    }
    
    if (caregiver.work_type) {
      parts.push(`⏱️ Work Type: ${caregiver.work_type}`);
    }
    
    if (caregiver.availability && caregiver.availability.length > 0) {
      parts.push(`📅 Availability: ${caregiver.availability.join(', ')}`);
    }
    
    if (caregiver.custom_schedule) {
      parts.push(`🗓️ Custom Schedule: ${caregiver.custom_schedule}`);
    }
    
    if (caregiver.match_explanation) {
      parts.push(`💫 Why they match: ${caregiver.match_explanation}`);
    }
    
    if (caregiver.shift_compatibility_score) {
      parts.push(`⏰ Schedule compatibility: ${caregiver.shift_compatibility_score}%`);
    }
    
    if (caregiver.bio) {
      parts.push(`📝 Professional Bio: ${caregiver.bio}`);
    }
    
    return parts.join('\n');
  }

  // Enhanced fallback responses based on stage and caregiver context
  private getFallbackResponse(stage: string, caregiver: Caregiver): string {
    const name = caregiver.full_name;
    const experience = caregiver.years_of_experience || 'experienced';
    const matchScore = caregiver.match_score;

    switch (stage) {
      case 'introduction':
        return `💙 Great choice! ${name} looks like an excellent match for your family with ${experience} in caregiving and a ${matchScore}% compatibility score. Would you like to learn more about their experience or express your interest in connecting?`;
      
      case 'interest_expression':
        return `🎉 Wonderful! I'm notifying ${name} about your interest right now. With their ${experience} background and ${matchScore}% match score, this could be a perfect fit for your family. They typically respond within 2-6 hours!`;
      
      case 'waiting_acceptance':
        return `💙 ${name} has been notified of your interest. Professional caregivers with ${experience} like them usually respond within a few hours. Their ${matchScore}% compatibility score suggests this could be an excellent match!`;
      
      case 'guided_qa':
        return `💙 Based on ${name}'s profile - with ${experience} experience and ${matchScore}% compatibility with your needs - they seem well-suited for your family. What specific aspects of caregiving would you like to discuss?`;
      
      default:
        return `💙 I'm here to help you connect with ${name}, who has ${experience} and a strong ${matchScore}% match with your family's needs. How can I assist you today?`;
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

      // Ensure caregiverId is a valid UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(caregiverId)) {
        console.error('[GuidedChatService] Invalid caregiver UUID format for status check:', caregiverId);
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
