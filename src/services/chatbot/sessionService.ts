
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { ChatbotConversation } from '@/types/chatbotTypes';
import { adaptChatbotConversationFromDb, adaptChatbotConversationToDb } from '@/adapters/chatbotAdapter';

// Define a flat type to avoid deep inference issues
type ChatbotConversationRow = {
  id: string;
  session_id: string;
  user_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_role?: string;
  contact_info?: any;
  care_needs?: any;
  conversation_data?: any;
  handoff_requested?: boolean;
  converted_to_registration?: boolean;
  lead_score?: number;
  qualification_status?: string;
};

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
    // Import needed adapter functions to prevent circular dependencies
    const { adaptContactInfoToDb, adaptCareNeedsToDb } = require('@/adapters/chatbotAdapter');
    
    // Convert the partial updates to the correct DB format
    const conversationForDb: Record<string, any> = {
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.leadScore !== undefined && { lead_score: updates.leadScore }),
      ...(updates.handoffRequested !== undefined && { handoff_requested: updates.handoffRequested }),
      ...(updates.convertedToRegistration !== undefined && { converted_to_registration: updates.convertedToRegistration }),
      ...(updates.qualificationStatus !== undefined && { qualification_status: updates.qualificationStatus }),
      ...(updates.userRole !== undefined && { user_role: updates.userRole })
    };

    // Process contactInfo if it exists
    if (updates.contactInfo) {
      const contactInfoDb = adaptContactInfoToDb(updates.contactInfo);
      conversationForDb.contact_info = JSON.stringify(contactInfoDb);
    }

    // Process careNeeds if it exists
    if (updates.careNeeds) {
      const careNeedsDb = adaptCareNeedsToDb(updates.careNeeds);
      conversationForDb.care_needs = JSON.stringify(careNeedsDb);
    }

    if (updates.conversationData) {
      conversationForDb.conversation_data = JSON.stringify(updates.conversationData);
    }

    // Split update and select operations to avoid TypeScript inference issues
    const { error: updateError } = await supabase
      .from('chatbot_conversations')
      .update(conversationForDb)
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      return null;
    }
    
    // Fetch the updated conversation in a separate query
    const { data, error: selectError } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('id', conversationId)
      .limit(1);
      
    if (selectError || !data || data.length === 0) {
      console.error('Error retrieving updated conversation:', selectError);
      return null;
    }
    
    // Cast to our flat type to avoid deep inference issues
    const updatedConversation = data[0] as unknown as ChatbotConversationRow;
    return adaptChatbotConversationFromDb(updatedConversation);
  } catch (error) {
    console.error('Error in updateConversation:', error);
    return null;
  }
}
