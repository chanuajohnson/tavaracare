
import { supabase } from '@/lib/supabase';
import { 
  ChatbotConversation, 
  ChatbotMessage,
  DbChatbotConversationInsert
} from '@/types/chatbot';
import { adaptConversationFromDb, adaptConversationToDb } from './adapters';
import { v4 as uuidv4 } from 'uuid';
import { createMessage } from './messageService';

export const createConversation = async (
  sessionId: string,
  userId?: string,
  initialMessages: ChatbotMessage[] = []
): Promise<ChatbotConversation | null> => {
  try {
    // Create conversation object
    const conversation: ChatbotConversation = {
      sessionId: sessionId || uuidv4(),
      userId,
      messages: initialMessages
    };
    
    // Convert to DB format
    const dbConversation: DbChatbotConversationInsert = adaptConversationToDb(conversation);
    
    // Insert into database
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .insert(dbConversation)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    
    // Convert back to domain model
    return adaptConversationFromDb(data);
  } catch (error) {
    console.error('Unexpected error creating conversation:', error);
    return null;
  }
};

export const getConversationById = async (
  conversationId: string
): Promise<ChatbotConversation | null> => {
  try {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
      
    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
    
    return adaptConversationFromDb(data);
  } catch (error) {
    console.error('Unexpected error fetching conversation:', error);
    return null;
  }
};

export const getConversationBySessionId = async (
  sessionId: string
): Promise<ChatbotConversation | null> => {
  try {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return null;
      }
      console.error('Error fetching conversation by session:', error);
      return null;
    }
    
    return adaptConversationFromDb(data);
  } catch (error) {
    console.error('Unexpected error fetching conversation by session:', error);
    return null;
  }
};

export const updateConversation = async (
  conversation: ChatbotConversation
): Promise<ChatbotConversation | null> => {
  try {
    if (!conversation.id) {
      console.error('Cannot update conversation without ID');
      return null;
    }
    
    // Convert to DB format
    const dbConversation = adaptConversationToDb(conversation);
    
    // Update in database
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .update(dbConversation)
      .eq('id', conversation.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating conversation:', error);
      return null;
    }
    
    return adaptConversationFromDb(data);
  } catch (error) {
    console.error('Unexpected error updating conversation:', error);
    return null;
  }
};

export const addMessageToConversation = async (
  conversationId: string,
  message: ChatbotMessage
): Promise<ChatbotConversation | null> => {
  try {
    // Create the message in the messages table
    const createdMessage = await createMessage(conversationId, message);
    
    if (!createdMessage) {
      return null;
    }
    
    // Get the updated conversation
    return await getConversationById(conversationId);
  } catch (error) {
    console.error('Unexpected error adding message to conversation:', error);
    return null;
  }
};

export const getUserConversations = async (
  userId: string
): Promise<ChatbotConversation[]> => {
  try {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
    
    return data.map(adaptConversationFromDb);
  } catch (error) {
    console.error('Unexpected error fetching user conversations:', error);
    return [];
  }
};

export const deleteConversation = async (
  conversationId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .delete()
      .eq('id', conversationId);
      
    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting conversation:', error);
    return false;
  }
};
