
import { ChatMessage, ChatOption } from '@/types/chatTypes';

export interface ChatConfig {
  mode: 'ai' | 'scripted' | 'hybrid';
  temperature?: number;
  fallbackThreshold?: number; // Number of retries before falling back to scripted
  useAIPrompts?: boolean; // Whether to use AI-generated prompts or scripted ones
}

// Default configuration - setting AI as the default mode
export const defaultChatConfig: ChatConfig = {
  mode: 'ai',
  temperature: 0.7,
  fallbackThreshold: 3,  // Increased to give AI more chances
  useAIPrompts: false    // Default to scripted prompts
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
