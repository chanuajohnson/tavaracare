
import { ChatbotConversation, ChatbotMessage, DbChatbotConversation, DbChatbotMessage } from "@/types/chatbot";
import { toJson, fromJson } from "@/utils/json-utils";

/**
 * Adapts a frontend ChatbotMessage to the DB format
 */
export const adaptMessageToDb = (message: ChatbotMessage): DbChatbotMessage => {
  // Validate required fields
  if (!message.message || !message.senderType) {
    throw new Error("Message and senderType are required for ChatbotMessage");
  }

  return {
    id: message.id,
    message: message.message,
    sender_type: message.senderType,
    conversation_id: message.conversationId,
    message_type: message.messageType,
    timestamp: message.timestamp || new Date().toISOString(),
    context_data: message.contextData ? toJson(message.contextData) : undefined
  };
};

/**
 * Adapts a DB ChatbotMessage to the frontend format
 */
export const adaptMessageFromDb = (dbMessage: DbChatbotMessage): ChatbotMessage => {
  return {
    id: dbMessage.id,
    message: dbMessage.message,
    senderType: dbMessage.sender_type,
    conversationId: dbMessage.conversation_id,
    messageType: dbMessage.message_type,
    timestamp: dbMessage.timestamp,
    contextData: dbMessage.context_data ? fromJson(dbMessage.context_data) : undefined
  };
};

/**
 * Adapts a frontend ChatbotConversation to the DB format
 */
export const adaptConversationToDb = (conversation: ChatbotConversation): DbChatbotConversation => {
  // Validate required field
  if (!conversation.sessionId) {
    throw new Error("SessionId is required for ChatbotConversation");
  }

  return {
    id: conversation.id,
    session_id: conversation.sessionId,
    user_id: conversation.userId,
    conversation_data: toJson(conversation.conversationData || []),
    care_needs: conversation.careNeeds ? toJson(conversation.careNeeds) : undefined,
    contact_info: conversation.contactInfo ? toJson(conversation.contactInfo) : undefined,
    handoff_requested: conversation.handoffRequested,
    converted_to_registration: conversation.convertedToRegistration,
    lead_score: conversation.leadScore,
    qualification_status: conversation.qualificationStatus,
    created_at: conversation.createdAt,
    updated_at: conversation.updatedAt || new Date().toISOString()
  };
};

/**
 * Adapts a DB ChatbotConversation to the frontend format
 */
export const adaptConversationFromDb = (dbConversation: DbChatbotConversation): ChatbotConversation => {
  return {
    id: dbConversation.id,
    sessionId: dbConversation.session_id,
    userId: dbConversation.user_id,
    conversationData: fromJson<ChatbotMessage[]>(dbConversation.conversation_data) || [],
    careNeeds: dbConversation.care_needs ? fromJson(dbConversation.care_needs) : undefined,
    contactInfo: dbConversation.contact_info ? fromJson(dbConversation.contact_info) : undefined,
    handoffRequested: dbConversation.handoff_requested,
    convertedToRegistration: dbConversation.converted_to_registration,
    leadScore: dbConversation.lead_score,
    qualificationStatus: dbConversation.qualification_status,
    createdAt: dbConversation.created_at,
    updatedAt: dbConversation.updated_at
  };
};
