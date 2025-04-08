
import { enhancedSupabaseClient } from '@/lib/supabase';
import { ChatbotMessage, ChatbotConversation } from '@/types/chatbot';
import { ChatbotAPIResponse, ChatbotAPISuccessResponse, DbChatbotMessage, DbChatbotConversation } from './types/chatbotTypes';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

/**
 * Hook for handling all Supabase API operations related to the chatbot
 */
export const useChatbotAPI = () => {
  /**
   * Fetches existing conversation for a user or session
   */
  const fetchExistingConversation = async (userId?: string, sessionId?: string): Promise<ChatbotAPIResponse<ChatbotConversation[]>> => {
    try {
      const query = enhancedSupabaseClient().client
        .from('chatbot_conversations')
        .select('*');
      
      // Apply filters based on available IDs
      const filteredQuery = userId 
        ? query.eq('user_id', userId)
        : sessionId 
          ? query.eq('session_id', sessionId)
          : query;
          
      const { data, error } = await filteredQuery;
      
      if (error) throw error;
      
      // Convert database results to our frontend model
      const conversations: ChatbotConversation[] = data?.map(item => ({
        id: item.id,
        userId: item.user_id,
        sessionId: item.session_id,
        conversationData: Array.isArray(item.conversation_data) 
          ? item.conversation_data.map((msg: any) => ({
              id: msg.id || uuidv4(),
              message: msg.message || '',
              senderType: msg.sender_type || 'system',
              timestamp: msg.timestamp || new Date().toISOString(),
              messageType: msg.message_type,
              contextData: msg.context_data
            }))
          : [],
        careNeeds: item.care_needs,
        qualificationStatus: item.qualification_status,
        leadScore: item.lead_score || 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        convertedToRegistration: item.converted_to_registration || false,
        contactInfo: item.contact_info,
        handoffRequested: item.handoff_requested || false
      })) || [];
      
      return {
        data: conversations,
        error: null
      };
    } catch (err) {
      console.error('Error fetching chatbot conversation:', err);
      return { data: null, error: err };
    }
  };

  /**
   * Fetches messages for a conversation
   */
  const fetchMessages = async (conversationId: string): Promise<ChatbotAPIResponse<ChatbotMessage[]>> => {
    try {
      const { data, error } = await enhancedSupabaseClient().client
        .from('chatbot_messages')
        .select('*')
        .eq('conversation_id', conversationId);
      
      if (error) throw error;
      
      // Convert database results to our frontend model
      const messages: ChatbotMessage[] = data?.map(item => ({
        id: item.id,
        message: item.message,
        senderType: item.sender_type as any,
        timestamp: item.timestamp,
        messageType: item.message_type as any,
        contextData: item.context_data
      })) || [];
      
      return {
        data: messages,
        error: null
      };
    } catch (err) {
      console.error('Error fetching chatbot messages:', err);
      return { data: [], error: err };
    }
  };

  /**
   * Creates a new conversation
   */
  const createConversation = async (
    sessionId: string, 
    userId?: string, 
    initialMessage?: ChatbotMessage
  ): Promise<ChatbotAPIResponse<ChatbotConversation>> => {
    try {
      const newConversationId = uuidv4();
      
      // Format initial message for database storage if provided
      const conversationData = initialMessage 
        ? [{
            id: initialMessage.id,
            message: initialMessage.message,
            sender_type: initialMessage.senderType,
            timestamp: initialMessage.timestamp,
            message_type: initialMessage.messageType,
            context_data: initialMessage.contextData
          }] 
        : [];
      
      // Insert with proper types
      const { error } = await enhancedSupabaseClient().client
        .from('chatbot_conversations')
        .insert({
          id: newConversationId,
          user_id: userId || null,
          session_id: sessionId,
          conversation_data: conversationData as unknown as Json,
          lead_score: 0,
          converted_to_registration: false,
          handoff_requested: false,
        });
      
      if (error) throw error;
      
      // Return the created conversation in our frontend model format
      return {
        data: {
          id: newConversationId,
          userId: userId,
          sessionId,
          conversationData: initialMessage ? [initialMessage] : [],
          leadScore: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          convertedToRegistration: false,
          handoffRequested: false,
        },
        error: null
      };
    } catch (err) {
      console.error('Error creating chatbot conversation:', err);
      return { data: null, error: err };
    }
  };

  /**
   * Saves a message to the database
   */
  const saveMessage = async (message: ChatbotMessage, conversationId: string): Promise<ChatbotAPISuccessResponse> => {
    try {
      // Convert our frontend message to database format
      const dbMessage: DbChatbotMessage = {
        id: message.id,
        conversation_id: conversationId,
        message: message.message,
        sender_type: message.senderType,
        timestamp: message.timestamp,
        message_type: message.messageType,
        context_data: message.contextData as unknown as Json
      };
      
      // Save message to chatbot_messages table
      const { error: messageError } = await enhancedSupabaseClient().client
        .from('chatbot_messages')
        .insert(dbMessage);
      
      if (messageError) throw messageError;
      
      return { success: true, error: null };
    } catch (err) {
      console.error('Error saving chatbot message:', err);
      return { success: false, error: err };
    }
  };

  /**
   * Updates an existing conversation
   */
  const updateConversation = async (
    conversationId: string, 
    updates: Partial<ChatbotConversation>
  ): Promise<ChatbotAPISuccessResponse> => {
    try {
      // Convert our frontend model to database format
      const dbUpdates: Partial<DbChatbotConversation> = {};
      
      if (updates.leadScore !== undefined) dbUpdates.lead_score = updates.leadScore;
      if (updates.convertedToRegistration !== undefined) dbUpdates.converted_to_registration = updates.convertedToRegistration;
      if (updates.handoffRequested !== undefined) dbUpdates.handoff_requested = updates.handoffRequested;
      if (updates.qualificationStatus !== undefined) dbUpdates.qualification_status = updates.qualificationStatus;
      if (updates.careNeeds !== undefined) dbUpdates.care_needs = updates.careNeeds as unknown as Json;
      if (updates.contactInfo !== undefined) dbUpdates.contact_info = updates.contactInfo as unknown as Json;
      
      // Always update the timestamp
      dbUpdates.updated_at = new Date().toISOString();
      
      const { error } = await enhancedSupabaseClient().client
        .from('chatbot_conversations')
        .update(dbUpdates)
        .eq('id', conversationId);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating chatbot conversation:', err);
      return { success: false, error: err };
    }
  };

  /**
   * Updates conversation with a new message
   */
  const updateConversationMessages = async (
    conversationId: string, 
    messages: ChatbotMessage[]
  ): Promise<ChatbotAPISuccessResponse> => {
    try {
      // Convert frontend messages to database format
      const dbMessages = messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        sender_type: msg.senderType,
        timestamp: msg.timestamp,
        message_type: msg.messageType,
        context_data: msg.contextData
      }));
      
      const { error } = await enhancedSupabaseClient().client
        .from('chatbot_conversations')
        .update({
          conversation_data: dbMessages as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating conversation messages:', err);
      return { success: false, error: err };
    }
  };

  return {
    fetchExistingConversation,
    fetchMessages,
    createConversation,
    saveMessage,
    updateConversation,
    updateConversationMessages
  };
};
