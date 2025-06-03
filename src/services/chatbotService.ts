
// Re-export from the chat folder
export { 
  getCurrentQuestion,
  isMultiSelectQuestion,
  getSectionTitle,
  getTotalSectionsForRole,
  isEndOfSection,
  isEndOfFlow,
  generateNextQuestionMessage,
  generateDataSummary 
} from './chat/responseUtils';

// Export validation utilities
export { validateChatInput } from './chat/utils/inputValidation';

// Export multi-selection utilities
export {
  setMultiSelectionMode,
  getMultiSelectionStatus,
  addToMultiSelection,
  removeFromMultiSelection,
  completeMultiSelection,
  resetMultiSelectionState,
  isTransitionOption
} from './chat/utils/multiSelectionManager';

// Export progress management utilities
export {
  updateChatProgress,
  saveChatResponse,
  getSessionResponses
} from './chat/utils/progressManager';
