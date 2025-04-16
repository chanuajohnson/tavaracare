
import { ChatMessage, ChatOption } from '@/types/chatTypes';

export interface ChatConfig {
  mode: 'ai' | 'scripted' | 'hybrid';
  temperature?: number;
  fallbackThreshold?: number; // Number of retries before falling back to scripted
}

// Default configuration - setting AI as the default mode
export const defaultChatConfig: ChatConfig = {
  mode: 'ai',
  temperature: 0.7,
  fallbackThreshold: 3  // Increased to give AI more chances
};

// Interface for tracking retry attempts
export interface RetryState {
  count: number;
  lastError: string | null;
}

export interface ChatResponse {
  message: string;
  options?: ChatOption[];
  validationNeeded?: string; // Field for input validation (email, phone, name, etc.)
}

// Adding this interface for AIFlowResponse to match usage in the code
export interface AIFlowResponse {
  message: string;
  options?: ChatOption[];
  validationNeeded?: string; // Field for input validation
}
