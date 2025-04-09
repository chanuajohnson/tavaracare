
import { 
  ChatFlowState, 
  ChatFlowAction,
  ChatStepType, 
  ChatbotMessage, 
  ChatSenderType,
  ChatMessageType,
  ContactInfo,
  CareNeeds 
} from '@/types/chatbotTypes';

export type { 
  ChatFlowState,
  ChatFlowAction,
  ChatbotMessage,
  ContactInfo,
  CareNeeds
};

export { 
  ChatStepType,
  ChatSenderType,
  ChatMessageType
};

// Initial state for the chat flow
export const initialChatFlowState: ChatFlowState = {
  currentStep: ChatStepType.WELCOME,
  conversation: {
    sessionId: '',
    conversationData: [],
  },
  isLoading: true,
  isMinimized: false,
  isOpen: false,
  sessionId: '',
};
