
import { Database } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';
import { ChatbotMessage, ChatbotConversation, SenderType, MessageType, toJson } from '@/types/chatbot';
import { adaptFromDb } from './adapter-utils';

// Type definition for database table
export type DbChatbotConversation = Database['public']['Tables']['chatbot_conversations']['Row'];

/**
 * Adapter for converting database conversation to frontend conversation
 */
export function adaptChatbotConversation(dbConversation: DbChatbotConversation): ChatbotConversation {
  const adapted = adaptFromDb<any>(dbConversation);
  
  // Handle the conversation_data field explicitly to ensure proper typing
  let conversationData: ChatbotMessage[] = [];
  
  if (Array.isArray(dbConversation.conversation_data)) {
    conversationData = (dbConversation.conversation_data as any[]).map(msg => {
      try {
        return {
          id: msg.id || crypto.randomUUID(),
          message: msg.message || '',
          senderType: msg.sender_type as SenderType || 'system',
          timestamp: msg.timestamp || new Date().toISOString(),
          messageType: msg.message_type as MessageType | undefined,
          contextData: msg.context_data ? msg.context_data as Record<string, any> : undefined
        };
      } catch (e) {
        console.error('Invalid message format in conversation data:', msg, e);
        // Provide a fallback with required fields
        return {
          id: crypto.randomUUID(),
          message: 'Invalid message format',
          senderType: 'system' as SenderType,
          timestamp: new Date().toISOString()
        };
      }
    });
  }
  
  return {
    id: adapted.id,
    userId: adapted.userId,
    sessionId: adapted.sessionId,
    conversationData: conversationData,
    careNeeds: adapted.careNeeds as Record<string, any> | null,
    qualificationStatus: adapted.qualificationStatus,
    leadScore: adapted.leadScore,
    createdAt: adapted.createdAt || new Date().toISOString(),
    updatedAt: adapted.updatedAt || new Date().toISOString(),
    convertedToRegistration: adapted.convertedToRegistration || false,
    contactInfo: adapted.contactInfo as Record<string, any> | null,
    handoffRequested: adapted.handoffRequested || false
  };
}

/**
 * Adapter for converting frontend conversation to database format
 */
export function adaptChatbotConversationToDb(conversation: Partial<ChatbotConversation>): Record<string, any> {
  if (!conversation) return {};
  
  // Verify required fields
  if (!conversation.sessionId) {
    throw new Error("Session ID is required for chatbot conversations");
  }
  
  // Handle the special case of conversationData
  const conversationData = conversation.conversationData?.map(msg => ({
    id: msg.id,
    message: msg.message,
    sender_type: msg.senderType,
    timestamp: msg.timestamp,
    message_type: msg.messageType,
    context_data: msg.contextData ? toJson(msg.contextData) : null
  })) || [];
  
  // Return object with exact field names expected by Supabase
  return {
    id: conversation.id,
    user_id: conversation.userId,
    session_id: conversation.sessionId,
    conversation_data: toJson(conversationData),
    care_needs: conversation.careNeeds ? toJson(conversation.careNeeds) : null,
    qualification_status: conversation.qualificationStatus,
    lead_score: conversation.leadScore,
    handoff_requested: conversation.handoffRequested,
    converted_to_registration: conversation.convertedToRegistration,
    contact_info: conversation.contactInfo ? toJson(conversation.contactInfo) : null,
    created_at: conversation.createdAt,
    updated_at: conversation.updatedAt
  };
}
