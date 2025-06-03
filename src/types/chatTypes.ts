
// This file is kept for backwards compatibility but is no longer used
// All chat functionality has been replaced with the TAV system

export interface LegacyChatOption {
  id: string;
  label: string;
  subtext?: string;
}

export interface LegacyChatMessage {
  id?: string;
  content: string;
  formattedContent?: string;
  isUser: boolean;
  timestamp: number;
  options?: LegacyChatOption[];
  isFormatted?: boolean;
}

// Legacy export for compatibility
export interface ChatMessage extends LegacyChatMessage {}

// These types are deprecated and will be removed in a future update
export interface PrefillData {
  [key: string]: string | string[] | number | boolean | undefined;
}

export interface ChatSession {
  sessionId: string;
  userRole?: 'family' | 'professional' | 'community';
  started: number;
  lastActive: number;
}
