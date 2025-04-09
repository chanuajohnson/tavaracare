
import { supabase } from '@/lib/supabase';
import { ChatbotConversation } from '@/types/chatbotTypes';
import { adaptChatbotConversationFromDb, adaptChatbotConversationToDb } from '@/adapters/chatbotAdapter';
import { ChatbotConversationRow } from './types';

// Initialize a conversation with Supabase
export async function initializeConversation(sessionId: string): Promise<ChatbotConversation | null> {
  try {
    // Check if there's an existing active conversation for this session
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
      
    // Handle potential errors
    if (error) {
      console.error('Error fetching existing conversation:', error);
      return null;
    }

    // If an active conversation exists, return it
    if (data && data.length > 0) {
      // Cast to our flat type to avoid deep inference issues
      const conversationRow = data[0] as unknown as ChatbotConversationRow;
      return adaptChatbotConversationFromDb(conversationRow);
    }

    // No active conversation found, create a new one
    const newConversation: ChatbotConversation = {
      sessionId,
      status: 'active',
      handoffRequested: false,
      convertedToRegistration: false,
      conversationData: []
    };

    const dbConversation = adaptChatbotConversationToDb(newConversation);
    
    // Split insert and select into separate operations
    const { error: insertError } = await supabase
      .from('chatbot_conversations')
      .insert([dbConversation]);

    if (insertError) {
      console.error('Error creating conversation:', insertError);
      return null;
    }
    
    // Fetch the newly created conversation in a separate query
    const { data: createdData, error: selectError } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (selectError || !createdData || createdData.length === 0) {
      console.error('Error retrieving created conversation:', selectError);
      return null;
    }
    
    // Cast to our flat type to avoid deep inference issues
    const createdConversation = createdData[0] as unknown as ChatbotConversationRow;
    return adaptChatbotConversationFromDb(createdConversation);
  } catch (error) {
    console.error('Error in initializeConversation:', error);
    return null;
  }
}

// Complete a conversation
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
