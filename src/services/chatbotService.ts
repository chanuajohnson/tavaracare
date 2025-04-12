
// Centralized export file for chat services
import {
  saveChatResponse,
  updateChatProgress,
  getChatProgress,
  getSessionResponses,
  completeSection,
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
import type { ChatProgress } from "./chat/types";

export {
  // Database operations
  saveChatResponse,
  updateChatProgress,
  getChatProgress,
  getSessionResponses,
  completeSection,
  
  // Response generation
  generateNextQuestionMessage,
  isEndOfSection,
  isEndOfFlow,
  getCurrentQuestion,
  generateDataSummary,
  getSectionTitle,
  
  // Session management
  getOrCreateSessionId,
  
  // Types
  ChatProgress,
};
