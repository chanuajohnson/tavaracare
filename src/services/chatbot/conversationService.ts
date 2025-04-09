
import { supabase } from '@/lib/supabase';
import { 
  ChatbotConversation,
  ChatbotMessage,
} from '@/types/chatbotTypes';
import {
  toConversationDto,
  fromConversationDto,
  ChatbotConversationDto,
} from '@/adapters/chatbotAdapter';

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
    
    // Import from messageService to avoid circular dependency
    const { getMessages } = await import('./messageService');
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
  contactInfo: any
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
  careNeeds: any
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
