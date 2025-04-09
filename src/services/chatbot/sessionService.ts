
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { ChatbotConversation, DbChatbotConversationInsert } from '@/types/chatbotTypes';
import { adaptChatbotConversationFromDb, adaptChatbotConversationToDb } from '@/adapters/chatbotAdapter';

// Generate a unique session ID
export function generateSessionId(): string {
  return uuidv4();
}

// Get or create a session ID from localStorage
export async function getOrCreateSessionId(): Promise<string> {
  const storedSessionId = localStorage.getItem('chatbot_session_id');
  
  if (storedSessionId) {
    return storedSessionId;
  }
  
  const newSessionId = generateSessionId();
  localStorage.setItem('chatbot_session_id', newSessionId);
  
  return newSessionId;
}

// Initialize a conversation with Supabase
export async function initializeConversation(sessionId: string): Promise<ChatbotConversation | null> {
  try {
    // Check if there's an existing active conversation for this session
    const { data: existingConversation, error: fetchError } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing conversation:', fetchError);
      return null;
    }

    // If an active conversation exists, return it
    if (existingConversation) {
      return adaptChatbotConversationFromDb(existingConversation);
    }

    // No active conversation found, create a new one
    const newConversation: ChatbotConversation = {
      sessionId,
      status: 'active',
      handoffRequested: false,
      convertedToRegistration: false,
      conversationData: []
    };

    const dbConversation: DbChatbotConversationInsert = adaptChatbotConversationToDb(newConversation);
    
    const { data: createdConversation, error: createError } = await supabase
      .from('chatbot_conversations')
      .insert([dbConversation])
      .select()
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return null;
    }

    return adaptChatbotConversationFromDb(createdConversation);
  } catch (error) {
    console.error('Error in initializeConversation:', error);
    return null;
  }
}

// Update conversation with user role
export async function updateConversationRole(
  conversationId: string, 
  userRole: 'family' | 'professional' | 'community'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ user_role: userRole })
      .eq('id', conversationId);

    return !error;
  } catch (error) {
    console.error('Error updating conversation role:', error);
    return false;
  }
}

// Link a conversation to a user (when they register/login)
export async function linkConversationToUser(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ user_id: userId })
      .eq('id', conversationId);

    return !error;
  } catch (error) {
    console.error('Error linking conversation to user:', error);
    return false;
  }
}

// Mark a conversation as completed
export async function completeConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return !error;
  } catch (error) {
    console.error('Error completing conversation:', error);
    return false;
  }
}

// Update conversation data (contact info, care needs, status, etc.)
export async function updateConversation(
  conversationId: string,
  updates: Partial<ChatbotConversation>
): Promise<ChatbotConversation | null> {
  try {
    const dbUpdates = adaptChatbotConversationToDb({
      ...updates,
      id: conversationId,
      sessionId: updates.sessionId || ''
    });

    const { data: updatedConversation, error } = await supabase
      .from('chatbot_conversations')
      .update(dbUpdates)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return null;
    }

    return adaptChatbotConversationFromDb(updatedConversation);
  } catch (error) {
    console.error('Error in updateConversation:', error);
    return null;
  }
}
