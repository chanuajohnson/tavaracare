
import { supabase } from '@/lib/supabase';
import { ChatbotConversation } from '@/types/chatbotTypes';
import { adaptChatbotConversationFromDb } from '@/adapters/chatbotAdapter';
import { ChatbotConversationRow } from './types';

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
