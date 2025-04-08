
import { enhancedSupabaseClient } from '@/lib/supabase';
import { ChatbotMessage, ChatbotConversation } from '@/types/chatbot';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook for handling all Supabase API operations related to the chatbot
 */
export const useChatbotAPI = () => {
  /**
   * Fetches existing conversation for a user or session
   */
  const fetchExistingConversation = async (userId?: string, sessionId?: string) => {
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
      
      // Use proper type assertion based on our schema
      return {
        data: data?.map(item => 
          enhancedSupabaseClient().chatbotConversations().adaptFromDb(item)
        ) as ChatbotConversation[] || [],
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
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await enhancedSupabaseClient().client
        .from('chatbot_messages')
        .select('*')
        .eq('conversation_id', conversationId);
      
      if (error) throw error;
      
      return {
        data: data?.map(item => 
          enhancedSupabaseClient().chatbotMessages().adaptFromDb(item)
        ) as ChatbotMessage[] || [],
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
  ) => {
    try {
      const newConversationId = uuidv4();
      const conversationData = initialMessage ? [initialMessage] : [];
      
      const { error } = await enhancedSupabaseClient().client
        .from('chatbot_conversations')
        .insert({
          id: newConversationId,
          user_id: userId || null,
          session_id: sessionId,
          conversation_data: conversationData,
          lead_score: 0,
          converted_to_registration: false,
          handoff_requested: false,
        });
      
      if (error) throw error;
      
      return {
        data: {
          id: newConversationId,
          userId: userId,
          sessionId,
          conversationData,
          leadScore: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          convertedToRegistration: false,
          handoffRequested: false,
        } as ChatbotConversation,
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
  const saveMessage = async (message: ChatbotMessage, conversationId: string) => {
    try {
      // Save message to chatbot_messages table
      const { error: messageError } = await enhancedSupabaseClient().client
        .from('chatbot_messages')
        .insert({
          id: message.id,
          conversation_id: conversationId,
          message: message.message,
          sender_type: message.senderType,
          timestamp: message.timestamp,
          message_type: message.messageType,
          context_data: message.contextData
        });
      
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
  ) => {
    try {
      const { error } = await enhancedSupabaseClient().client
        .from('chatbot_conversations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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
  ) => {
    try {
      const { error } = await enhancedSupabaseClient().client
        .from('chatbot_conversations')
        .update({
          conversation_data: messages,
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
