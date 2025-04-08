
import { enhancedSupabaseClient } from '@/lib/supabase';
import { ChatbotMessage } from '@/types/chatbot';
import { ChatbotAPIResponse, ChatbotAPISuccessResponse } from '@/hooks/types/chatbotTypes';
import { adaptChatbotMessage, adaptChatbotMessageToDb } from '@/lib/supabase-adapter';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetches messages for a conversation
 */
export const fetchMessages = async (conversationId: string): Promise<ChatbotAPIResponse<ChatbotMessage[]>> => {
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
 * Saves a message to the database
 */
export const saveMessage = async (message: ChatbotMessage, conversationId: string): Promise<ChatbotAPISuccessResponse> => {
  try {
    // Ensure conversationId is set
    const completeMessage: ChatbotMessage = {
      ...message,
      conversationId: conversationId
    };
    
    // Convert our frontend message to database format
    const dbMessage = adaptChatbotMessageToDb(completeMessage);
    
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
 * Creates a new message with defaults
 */
export const createMessage = (
  message: string, 
  senderType: string, 
  messageType?: string, 
  contextData?: Record<string, any>
): ChatbotMessage => {
  return {
    id: uuidv4(),
    message,
    senderType,
    messageType,
    contextData,
    timestamp: new Date().toISOString()
  };
};
