
import { supabase } from '@/lib/supabase';
import { ChatbotMessage, DbChatbotMessageInsert } from '@/types/chatbotTypes';
import { adaptChatbotMessageFromDb, adaptChatbotMessageToDb } from '@/adapters/chatbotAdapter';

// Send a user message to the chatbot conversation
export async function sendUserMessage(
  conversationId: string,
  message: string,
  contextData?: any
): Promise<ChatbotMessage | null> {
  try {
    const userMessage: ChatbotMessage = {
      conversationId,
      senderType: 'user',
      message,
      messageType: 'text',
      timestamp: new Date().toISOString(),
      contextData
    };

    const dbMessage: DbChatbotMessageInsert = adaptChatbotMessageToDb(userMessage);
    
    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert([dbMessage])
      .select()
      .single();

    if (error) {
      console.error('Error sending user message:', error);
      return null;
    }

    // Also update the conversation's updated_at timestamp
    await supabase
      .from('chatbot_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return adaptChatbotMessageFromDb(data);
  } catch (error) {
    console.error('Error in sendUserMessage:', error);
    return null;
  }
}

// Send a bot message to the chatbot conversation
export async function sendBotMessage(
  conversationId: string,
  message: string,
  messageType: 'text' | 'option' = 'text',
  options?: { label: string; value: string }[]
): Promise<ChatbotMessage | null> {
  try {
    const botMessage: ChatbotMessage = {
      conversationId,
      senderType: 'bot',
      message,
      messageType,
      timestamp: new Date().toISOString(),
      options
    };

    const dbMessage: DbChatbotMessageInsert = adaptChatbotMessageToDb(botMessage);
    
    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert([dbMessage])
      .select()
      .single();

    if (error) {
      console.error('Error sending bot message:', error);
      return null;
    }

    return adaptChatbotMessageFromDb(data);
  } catch (error) {
    console.error('Error in sendBotMessage:', error);
    return null;
  }
}

// Get all messages for a conversation
export async function getMessagesBySessionId(sessionId: string): Promise<ChatbotMessage[]> {
  try {
    // First get the conversation ID
    const { data: conversation, error: convError } = await supabase
      .from('chatbot_conversations')
      .select('id')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (convError || !conversation) {
      console.error('Error fetching conversation by session ID:', convError);
      return [];
    }

    // Then get all messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('timestamp', { ascending: true });

    if (msgError) {
      console.error('Error fetching messages:', msgError);
      return [];
    }

    return messages.map(adaptChatbotMessageFromDb);
  } catch (error) {
    console.error('Error in getMessagesBySessionId:', error);
    return [];
  }
}

// Get messages by conversation ID
export async function getMessagesByConversationId(conversationId: string): Promise<ChatbotMessage[]> {
  try {
    const { data: messages, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching messages by conversation ID:', error);
      return [];
    }

    return messages.map(adaptChatbotMessageFromDb);
  } catch (error) {
    console.error('Error in getMessagesByConversationId:', error);
    return [];
  }
}

// Update conversation with the latest message data
export async function updateContactInfo(
  conversationId: string,
  contactInfo: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ 
        contact_info: contactInfo,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return !error;
  } catch (error) {
    console.error('Error updating contact info:', error);
    return false;
  }
}

// Update care needs in the conversation
export async function updateCareNeeds(
  conversationId: string,
  careNeeds: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ 
        care_needs: careNeeds,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return !error;
  } catch (error) {
    console.error('Error updating care needs:', error);
    return false;
  }
}

// Mark conversation as converted to registration
export async function updateConversionStatus(
  conversationId: string,
  converted: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ 
        converted_to_registration: converted,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return !error;
  } catch (error) {
    console.error('Error updating conversion status:', error);
    return false;
  }
}
