
import { 
  ChatbotMessage, 
  ChatbotConversation, 
  DbChatbotMessage, 
  DbChatbotConversation,
  DbChatbotMessageInsert,
  DbChatbotConversationInsert
} from '@/types/chatbot';

// Adapters to convert between domain and database models
export const adaptMessageToDb = (message: ChatbotMessage): DbChatbotMessageInsert => {
  return {
    sender_type: message.sender,
    message: message.content,
    message_type: message.type,
    context_data: message.contextData // Using any type from DbChatbotMessageInsert
  };
};

export const adaptMessageFromDb = (dbMessage: DbChatbotMessage): ChatbotMessage => {
  return {
    id: dbMessage.id,
    sender: dbMessage.sender_type as any,
    content: dbMessage.message,
    type: dbMessage.message_type as any,
    timestamp: dbMessage.timestamp,
    contextData: dbMessage.context_data as any
  };
};

export const adaptConversationToDb = (conversation: ChatbotConversation): DbChatbotConversationInsert => {
  return {
    user_id: conversation.userId,
    session_id: conversation.sessionId,
    conversation_data: conversation.messages, // Using any type from DbChatbotConversationInsert
    care_needs: conversation.careNeeds,
    contact_info: conversation.contactInfo,
    lead_score: conversation.leadScore,
    qualification_status: conversation.qualificationStatus,
    handoff_requested: conversation.handoffRequested,
    converted_to_registration: conversation.convertedToRegistration
  };
};

export const adaptConversationFromDb = (dbConversation: DbChatbotConversation): ChatbotConversation => {
  return {
    id: dbConversation.id,
    userId: dbConversation.user_id,
    sessionId: dbConversation.session_id,
    messages: (dbConversation.conversation_data as any) || [],
    createdAt: dbConversation.created_at,
    updatedAt: dbConversation.updated_at,
    careNeeds: dbConversation.care_needs as any,
    contactInfo: dbConversation.contact_info as any,
    leadScore: dbConversation.lead_score,
    qualificationStatus: dbConversation.qualification_status,
    handoffRequested: dbConversation.handoff_requested,
    convertedToRegistration: dbConversation.converted_to_registration
  };
};
