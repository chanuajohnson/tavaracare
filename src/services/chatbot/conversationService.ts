
import { enhancedSupabaseClient } from '@/lib/supabase';
import { ChatbotConversation, ChatbotMessage } from '@/types/chatbot';
import { ChatbotAPIResponse, ChatbotAPISuccessResponse } from '@/hooks/types/chatbotTypes';
import { 
  adaptChatbotConversation, 
  adaptChatbotConversationToDb 
} from '@/lib/adapters';
import { v4 as uuidv4 } from 'uuid';
import { toJson } from '@/lib/adapters';

/**
 * Fetches existing conversation for a user or session
 */
export const fetchExistingConversation = async (userId?: string, sessionId?: string): Promise<ChatbotAPIResponse<ChatbotConversation[]>> => {
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
 * Creates a new conversation
 */
export const createConversation = async (
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
    
    // Insert into database - ensure it's wrapped in an array
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
 * Updates an existing conversation
 */
export const updateConversation = async (
  conversationId: string, 
  updates: Partial<ChatbotConversation>
): Promise<ChatbotAPISuccessResponse> => {
  try {
    // Convert our frontend model to database format
    const dbUpdates = adaptChatbotConversationToDb({
      ...updates,
      id: conversationId // Ensure ID is included for the update
    });
    
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
export const updateConversationMessages = async (
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
      context_data: msg.contextData ? toJson(msg.contextData) : null
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
