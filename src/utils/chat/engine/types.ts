
import { ChatMessage, ChatOption } from '@/types/chatTypes';

export interface ChatConfig {
  mode: 'ai' | 'scripted' | 'hybrid';
  temperature?: number;
  fallbackThreshold?: number; // Number of retries before falling back to scripted
}

// Default configuration
export const defaultChatConfig: ChatConfig = {
  mode: 'ai',
  temperature: 0.7,
  fallbackThreshold: 2
};

// Interface for tracking retry attempts
export interface RetryState {
  count: number;
  lastError: string | null;
}

export interface ChatResponse {
  message: string;
  options?: ChatOption[];
  validationNeeded?: string; // Add this field for input validation
}
