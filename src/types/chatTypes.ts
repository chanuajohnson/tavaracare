
export interface ChatOption {
  id: string;
  label: string;
  subtext?: string;
}

export interface ChatMessage {
  id?: string;            // Add unique ID for each message
  content: string;        // Original unformatted content
  formattedContent?: string; // Pre-formatted content to display
  isUser: boolean;
  timestamp: number;
  options?: ChatOption[];
  isFormatted?: boolean;  // Flag to track if message has been formatted
}

export interface PrefillData {
  [key: string]: string | string[] | number | boolean | undefined;
}

export interface ChatSession {
  sessionId: string;
  userRole?: 'family' | 'professional' | 'community';
  started: number;
  lastActive: number;
}
