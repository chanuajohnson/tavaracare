
export interface ChatOption {
  id: string;
  label: string;
  subtext?: string;
}

export interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: number;
  options?: ChatOption[];
}

export interface ChatResponseData {
  message: string;
  options?: ChatOption[];
}

export interface PrefillData {
  [key: string]: string | string[] | number | boolean | undefined;
}

export interface ChatSession {
  sessionId: string;
  userRole?: 'family' | 'professional' | 'community';
  started: number;
  lastActive: number;
  completed?: boolean;
}

export interface ChatProgress {
  role: string | null;
  questionIndex: number;
  conversationStage?: 'intro' | 'questions' | 'completion';
}

export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};
