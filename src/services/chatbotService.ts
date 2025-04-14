
// Centralized export file for chat services
import {
  saveChatResponse,
  updateChatProgress,
  getChatProgress,
  getSessionResponses,
  completeSection,
  ChatProgress,
  validateChatInput
} from "./chat/databaseUtils";

import {
  generateNextQuestionMessage,
  isEndOfSection,
  isEndOfFlow,
  getCurrentQuestion,
  generateDataSummary,
  getSectionTitle,
} from "./chat/responseUtils";

import { getOrCreateSessionId } from "./chat/sessionUtils";

export {
  // Database operations
  saveChatResponse,
  updateChatProgress,
  getChatProgress,
  getSessionResponses,
  completeSection,
  validateChatInput,
  
  // Response generation
  generateNextQuestionMessage,
  isEndOfSection,
  isEndOfFlow,
  getCurrentQuestion,
  generateDataSummary,
  getSectionTitle,
  
  // Session management
  getOrCreateSessionId,
};

// Type exports
export type { ChatProgress };
