
import { supabase } from '@/lib/supabase';
import { ChatbotMessage, ChatOption, ChatbotMessageType } from '@/types/chatbotTypes';
import { adaptChatbotMessageFromDb, adaptChatbotMessageToDb } from '@/adapters/chatbotAdapter';

// Get all messages for a conversation
export async function getMessagesByConversationId(conversationId: string): Promise<ChatbotMessage[]> {
  try {
    const { data: messages, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return messages.map(message => adaptChatbotMessageFromDb(message));
  } catch (error) {
    console.error('Error in getMessagesByConversationId:', error);
    return [];
  }
}

// Send a user message
export async function sendUserMessage(
  conversationId: string,
  message: string,
  contextData?: any
): Promise<ChatbotMessage | null> {
  try {
    const newMessage: ChatbotMessage = {
      conversationId,
      senderType: 'user',
      message,
      messageType: 'text',
      timestamp: new Date().toISOString(),
      contextData
    };
    
    const dbMessage = adaptChatbotMessageToDb(newMessage);
    
    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert([dbMessage])
      .select()
      .single();
    
    if (error) {
      console.error('Error sending user message:', error);
      return null;
    }
    
    return adaptChatbotMessageFromDb(data);
  } catch (error) {
    console.error('Error in sendUserMessage:', error);
    return null;
  }
}

// Send a bot message
export async function sendBotMessage(
  conversationId: string,
  message: string,
  messageType: ChatbotMessageType = 'text',
  options?: ChatOption[]
): Promise<ChatbotMessage | null> {
  try {
    const newMessage: ChatbotMessage = {
      conversationId,
      senderType: 'bot',
      message,
      messageType,
      timestamp: new Date().toISOString(),
      options,
      contextData: options ? { options } : undefined
    };
    
    const dbMessage = adaptChatbotMessageToDb(newMessage);
    
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
