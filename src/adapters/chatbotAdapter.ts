
import { 
  ChatbotMessage, 
  ChatbotConversation, 
  ContactInfo, 
  CareNeeds,
  DbChatbotMessage, 
  DbChatbotConversation,
  DbContactInfo,
  DbCareNeeds
} from '../types/chatbotTypes';
import { fromJson, toJson } from '../utils/json';

// Adapt contact info to DB format
export function adaptContactInfoToDb(contactInfo: ContactInfo): DbContactInfo {
  return {
    full_name: contactInfo.fullName,
    email: contactInfo.email,
    phone: contactInfo.phone,
    city: contactInfo.city
  };
}

// Adapt contact info from DB format
export function adaptContactInfoFromDb(dbContactInfo: DbContactInfo): ContactInfo {
  return {
    fullName: dbContactInfo.full_name,
    email: dbContactInfo.email,
    phone: dbContactInfo.phone,
    city: dbContactInfo.city
  };
}

// Adapt care needs to DB format
export function adaptCareNeedsToDb(careNeeds: CareNeeds): DbCareNeeds {
  return {
    care_type: careNeeds.careType,
    relationship: careNeeds.relationship,
    schedule: careNeeds.schedule,
    additional_details: careNeeds.additionalDetails
  };
}

// Adapt care needs from DB format
export function adaptCareNeedsFromDb(dbCareNeeds: DbCareNeeds): CareNeeds {
  return {
    careType: dbCareNeeds.care_type,
    relationship: dbCareNeeds.relationship,
    schedule: dbCareNeeds.schedule,
    additionalDetails: dbCareNeeds.additional_details
  };
}

// Convert chatbot message to DB format
export function adaptChatbotMessageToDb(message: ChatbotMessage): DbChatbotMessage {
  const contextData: Record<string, any> = {};
  
  // Copy existing contextData if present
  if (message.contextData) {
    Object.assign(contextData, message.contextData);
  }
  
  // Add options to contextData if they exist
  if (message.options && message.options.length > 0) {
    contextData.options = message.options;
  }

  return {
    id: message.id,
    conversation_id: message.conversationId || '',
    sender_type: message.senderType,
    message: message.message,
    message_type: message.messageType,
    timestamp: message.timestamp,
    context_data: Object.keys(contextData).length > 0 ? toJson(contextData) : undefined
  };
}

// Convert chatbot message from DB format
export function adaptChatbotMessageFromDb(dbMessage: any): ChatbotMessage {
  const contextData = dbMessage.context_data ? 
    fromJson(dbMessage.context_data, {}) : 
    {};
  
  return {
    id: dbMessage.id,
    conversationId: dbMessage.conversation_id,
    senderType: dbMessage.sender_type,
    message: dbMessage.message,
    messageType: dbMessage.message_type,
    timestamp: dbMessage.timestamp,
    options: contextData.options,
    contextData: contextData
  };
}

// Convert chatbot conversation to DB format
export function adaptChatbotConversationToDb(
  conversation: ChatbotConversation
): DbChatbotConversation {
  return {
    id: conversation.id,
    session_id: conversation.sessionId,
    user_id: conversation.userId,
    status: conversation.status,
    lead_score: conversation.leadScore,
    handoff_requested: conversation.handoffRequested,
    converted_to_registration: conversation.convertedToRegistration,
    conversation_data: conversation.conversationData ? toJson(conversation.conversationData) : undefined,
    contact_info: conversation.contactInfo ? toJson(adaptContactInfoToDb(conversation.contactInfo)) : undefined,
    care_needs: conversation.careNeeds ? toJson(adaptCareNeedsToDb(conversation.careNeeds)) : undefined,
    qualification_status: conversation.qualificationStatus,
    user_role: conversation.userRole
  };
}

// Convert chatbot conversation from DB format
export function adaptChatbotConversationFromDb(dbConversation: any): ChatbotConversation {
  // Parse JSON fields
  const conversationData = dbConversation.conversation_data ? 
    fromJson(dbConversation.conversation_data, []) : 
    [];
  
  const contactInfo = dbConversation.contact_info ? 
    adaptContactInfoFromDb(fromJson(dbConversation.contact_info, {})) : 
    undefined;
  
  const careNeeds = dbConversation.care_needs ? 
    adaptCareNeedsFromDb(fromJson(dbConversation.care_needs, {})) : 
    undefined;

  return {
    id: dbConversation.id,
    sessionId: dbConversation.session_id,
    userId: dbConversation.user_id,
    createdAt: dbConversation.created_at,
    updatedAt: dbConversation.updated_at,
    status: dbConversation.status || 'active',
    leadScore: dbConversation.lead_score,
    handoffRequested: dbConversation.handoff_requested || false,
    convertedToRegistration: dbConversation.converted_to_registration || false,
    conversationData: Array.isArray(conversationData) ? conversationData : [],
    contactInfo,
    careNeeds,
    qualificationStatus: dbConversation.qualification_status,
    userRole: dbConversation.user_role
  };
}
