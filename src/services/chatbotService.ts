
import { supabase } from '@/lib/supabase';
import { 
  ChatbotConversation, 
  ChatbotMessage, 
  ChatSenderType,
  ChatMessageType,
  ContactInfo,
  CareNeeds,
} from '@/types/chatbotTypes';
import {
  toConversationDto,
  fromConversationDto,
  toMessageDto,
  fromMessageDto,
  ChatbotConversationDto,
  ChatbotMessageDto,
} from '@/adapters/chatbotAdapter';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new conversation in the database
 * @param sessionId The session ID for the conversation
 * @returns The created conversation
 */
export async function createConversation(
  sessionId: string
): Promise<ChatbotConversation | null> {
  try {
    const newConversation: ChatbotConversation = {
      sessionId,
      conversationData: [], // Ensure this is always defined
    };

    const { data, error } = await supabase
      .from('chatbot_conversations')
      .insert([toConversationDto(newConversation)])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return fromConversationDto(data as ChatbotConversationDto);
  } catch (error) {
    console.error('Exception creating conversation:', error);
    return null;
  }
}

/**
 * Gets a conversation from the database by ID or session ID
 * @param idOrSessionId The conversation ID or session ID
 * @returns The conversation if found, null otherwise
 */
export async function getConversation(
  idOrSessionId: string
): Promise<ChatbotConversation | null> {
  try {
    // Try to find by ID first
    let query = supabase.from('chatbot_conversations').select('*');

    if (idOrSessionId.includes('-')) {
      // Looks like UUID, search by ID
      query = query.eq('id', idOrSessionId);
    } else {
      // Search by session ID
      query = query.eq('session_id', idOrSessionId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error getting conversation:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Get messages for this conversation
    const conversation = fromConversationDto(data as ChatbotConversationDto);
    const messages = await getMessages(conversation.id as string);
    
    if (messages) {
      conversation.conversationData = messages;
    }

    return conversation;
  } catch (error) {
    console.error('Exception getting conversation:', error);
    return null;
  }
}

/**
 * Updates an existing conversation in the database
 * @param id The conversation ID
 * @param updates The updates to apply
 * @returns The updated conversation
 */
export async function updateConversation(
  id: string,
  updates: Partial<ChatbotConversation>
): Promise<ChatbotConversation | null> {
  try {
    if (!id) {
      console.error('No conversation ID provided for update');
      return null;
    }

    // Ensure conversationData is always defined if we're updating it
    const completeUpdates = {
      ...updates,
      conversationData: updates.conversationData || []
    };

    const { data, error } = await supabase
      .from('chatbot_conversations')
      .update(toConversationDto({ ...completeUpdates, id, sessionId: updates.sessionId || '' }))
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return null;
    }

    return fromConversationDto(data as ChatbotConversationDto);
  } catch (error) {
    console.error('Exception updating conversation:', error);
    return null;
  }
}

/**
 * Updates the contact information for a conversation
 * @param conversationId The conversation ID
 * @param contactInfo The contact information to save
 * @returns The updated conversation
 */
export async function updateContactInfo(
  conversationId: string,
  contactInfo: ContactInfo
): Promise<ChatbotConversation | null> {
  return updateConversation(conversationId, { contactInfo });
}

/**
 * Updates the care needs for a conversation
 * @param conversationId The conversation ID
 * @param careNeeds The care needs to save
 * @returns The updated conversation
 */
export async function updateCareNeeds(
  conversationId: string,
  careNeeds: CareNeeds
): Promise<ChatbotConversation | null> {
  return updateConversation(conversationId, { careNeeds });
}

/**
 * Updates the conversion status for a conversation
 * @param conversationId The conversation ID
 * @param converted Whether the conversation was converted to a registration
 * @returns The updated conversation
 */
export async function updateConversionStatus(
  conversationId: string,
  converted: boolean
): Promise<ChatbotConversation | null> {
  return updateConversation(conversationId, { convertedToRegistration: converted });
}

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

/**
 * Gets or creates a session ID for the current user
 * @returns The session ID
 */
export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('chat_session_id');
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('chat_session_id', sessionId);
  }
  
  return sessionId;
}

/**
 * Initializes a conversation, creating a new one if needed
 * @returns The conversation
 */
export async function initializeConversation(): Promise<ChatbotConversation | null> {
  const sessionId = getOrCreateSessionId();
  
  // Try to find existing conversation
  let conversation = await getConversation(sessionId);
  
  // Create new conversation if none exists
  if (!conversation) {
    conversation = await createConversation(sessionId);
  }
  
  return conversation;
}
