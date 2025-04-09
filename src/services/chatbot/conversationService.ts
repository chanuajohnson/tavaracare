
import { ChatbotConversation } from '@/types/chatbotTypes';
import { adaptChatbotConversationFromDb, adaptChatbotConversationToDb } from '@/adapters/chatbotAdapter';
import { 
  queryTable, 
  getByField,
  insertRecord,
  updateRecord
} from '@/utils/supabase/query-helpers';
import { ChatbotConversationRow } from '@/utils/supabase/types';

// Initialize a conversation with Supabase
export async function initializeConversation(sessionId: string): Promise<ChatbotConversation | null> {
  try {
    // Check if there's an existing active conversation for this session
    const conversations = await getByField<ChatbotConversationRow>(
      'chatbot_conversations',
      'session_id',
      sessionId,
      '*'
    );
    
    const activeConversations = conversations.filter(conv => conv.status === 'active');
    
    // If an active conversation exists, return it
    if (activeConversations.length > 0) {
      const conversationRow = activeConversations[0];
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
    
    // Insert the new conversation
    const createdConversation = await insertRecord<ChatbotConversationRow>(
      'chatbot_conversations',
      dbConversation,
      { returnFields: '*' }
    );
    
    if (!createdConversation) {
      console.error('Failed to create and retrieve conversation');
      return null;
    }
    
    return adaptChatbotConversationFromDb(createdConversation);
  } catch (error) {
    console.error('Error in initializeConversation:', error);
    return null;
  }
}

// Complete a conversation
export async function completeConversation(conversationId: string): Promise<boolean> {
  try {
    const updated = await updateRecord<ChatbotConversationRow>(
      'chatbot_conversations',
      conversationId,
      { 
        status: 'completed',
        updated_at: new Date().toISOString()
      }
    );

    return !!updated;
  } catch (error) {
    console.error('Error completing conversation:', error);
    return false;
  }
}
