
import { supabase } from '@/lib/supabase';
import { 
  ChatbotMessage, 
  ChatSenderType,
  ChatMessageType,
} from '@/types/chatbotTypes';
import {
  toMessageDto,
  fromMessageDto,
  ChatbotMessageDto,
} from '@/adapters/chatbotAdapter';

/**
 * Gets all messages for a conversation
 * @param conversationId The conversation ID
 * @returns An array of messages
 */
export async function getMessages(
  conversationId: string
): Promise<ChatbotMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error getting messages:', error);
      return [];
    }

    return (data as ChatbotMessageDto[]).map(fromMessageDto);
  } catch (error) {
    console.error('Exception getting messages:', error);
    return [];
  }
}

/**
 * Adds a new message to a conversation
 * @param conversationId The conversation ID
 * @param message The message to add
 * @returns The added message
 */
export async function addMessage(
  conversationId: string,
  message: Omit<ChatbotMessage, 'id' | 'conversationId' | 'timestamp'>
): Promise<ChatbotMessage | null> {
  try {
    const fullMessage: ChatbotMessage = {
      ...message,
      conversationId,
    };

    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert([toMessageDto(fullMessage)])
      .select('*')
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    return fromMessageDto(data as ChatbotMessageDto);
  } catch (error) {
    console.error('Exception adding message:', error);
    return null;
  }
}

/**
 * Sends a user message to the conversation
 * @param conversationId The conversation ID
 * @param text The message text
 * @param contextData Optional context data
 * @returns The added message
 */
export async function sendUserMessage(
  conversationId: string,
  text: string,
  contextData?: any
): Promise<ChatbotMessage | null> {
  return addMessage(conversationId, {
    senderType: ChatSenderType.USER,
    message: text,
    messageType: ChatMessageType.TEXT,
    contextData,
  });
}

/**
 * Sends a bot message to the conversation
 * @param conversationId The conversation ID
 * @param text The message text
 * @param options Optional options for quick replies
 * @param contextData Optional context data
 * @returns The added message
 */
export async function sendBotMessage(
  conversationId: string,
  text: string,
  options?: any[],
  contextData?: any
): Promise<ChatbotMessage | null> {
  return addMessage(conversationId, {
    senderType: ChatSenderType.BOT,
    message: text,
    messageType: options ? ChatMessageType.OPTION : ChatMessageType.TEXT,
    contextData: {
      ...contextData,
      options,
    },
  });
}
