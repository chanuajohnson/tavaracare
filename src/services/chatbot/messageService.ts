
import { supabase } from '@/lib/supabase';
import { ChatbotMessage, DbChatbotMessageInsert } from '@/types/chatbot';
import { adaptMessageFromDb, adaptMessageToDb } from './adapters';

export const createMessage = async (
  conversationId: string,
  message: ChatbotMessage
): Promise<ChatbotMessage | null> => {
  try {
    // Use the adapter to convert to DB format
    const dbMessage: DbChatbotMessageInsert = adaptMessageToDb(message);
    
    // Add conversation ID
    dbMessage.conversation_id = conversationId;
    
    // Insert into database
    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert(dbMessage)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating message:', error);
      return null;
    }
    
    // Convert back to domain model
    return adaptMessageFromDb(data);
  } catch (error) {
    console.error('Unexpected error creating message:', error);
    return null;
  }
};

export const getMessagesByConversationId = async (
  conversationId: string
): Promise<ChatbotMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
      
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return data.map(adaptMessageFromDb);
  } catch (error) {
    console.error('Unexpected error fetching messages:', error);
    return [];
  }
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chatbot_messages')
      .delete()
      .eq('id', messageId);
      
    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting message:', error);
    return false;
  }
};
