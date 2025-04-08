
export type SenderType = 'bot' | 'user' | 'system';
export type MessageType = 'greeting' | 'question' | 'response' | 'suggestion' | 'action';

export interface ChatbotMessage {
  id: string;
  message: string;
  senderType: SenderType;
  timestamp: string;
  messageType?: MessageType;
  contextData?: Record<string, any>;
}

export interface ChatbotConversation {
  id: string;
  userId?: string;
  sessionId: string;
  conversationData: ChatbotMessage[];
  careNeeds?: Record<string, any>;
  qualificationStatus?: string;
  leadScore?: number;
  createdAt: string;
  updatedAt: string;
  convertedToRegistration: boolean;
  contactInfo?: Record<string, any>;
  handoffRequested: boolean;
}

export interface ChatbotState {
  conversation: ChatbotConversation | null;
  currentMessage: string;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

export interface ChatbotAction {
  type: string;
  label: string;
  action: () => void;
  icon?: React.ReactNode;
}
