import { enhancedSupabaseClient } from '@/lib/supabase';
import { ChatbotMessage, ChatbotConversation, SenderType, MessageType, toJson } from '@/types/chatbot';
import { ChatbotAPIResponse, ChatbotAPISuccessResponse } from './types/chatbotTypes';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';
import { 
  adaptChatbotMessage, 
  adaptChatbotMessageToDb, 
  adaptChatbotConversation, 
  adaptChatbotConversationToDb 
} from '@/lib/supabase-adapter';

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
      const conversations: ChatbotConversation[] = data?.map(item => 
        adaptChatbotConversation(item)
      ) || [];
      
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
      const messages: ChatbotMessage[] = data?.map(item => 
        adaptChatbotMessage(item)
      ) || [];
      
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
      
      // Create new conversation object with all required fields
      const newConversation: ChatbotConversation = {
        id: newConversationId,
        userId: userId,
        sessionId: sessionId,
        conversationData: initialMessage ? [initialMessage] : [],
        leadScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        convertedToRegistration: false,
        handoffRequested: false,
      };
      
      // Convert to database format
      const dbConversation = adaptChatbotConversationToDb(newConversation);
      
      // Insert into database
      const { error } = await enhancedSupabaseClient().client
        .from('chatbot_conversations')
        .insert([dbConversation]);
      
      if (error) throw error;
      
      return {
        data: newConversation,
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
      // Ensure conversationId is set
      const completeMessage: ChatbotMessage = {
        ...message,
        conversationId: conversationId
      };
      
      // Convert our frontend message to database format
      const dbMessage = adaptChatbotMessageToDb(completeMessage);
      
      // Ensure required fields are present
      if (!dbMessage.message) {
        throw new Error("Message content is required");
      }
      
      if (!dbMessage.sender_type) {
        throw new Error("Sender type is required");
      }
      
      // Save message to chatbot_messages table
      const { error: messageError } = await enhancedSupabaseClient().client
        .from('chatbot_messages')
        .insert([dbMessage]);
      
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
      const dbUpdates = adaptChatbotConversationToDb(updates);
      
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
        context_data: toJson(msg.contextData)
      }));
      
      const { error } = await enhancedSupabaseClient().client
        .from('chatbot_conversations')
        .update({
          conversation_data: toJson(dbMessages),
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
