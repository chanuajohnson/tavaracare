
// Re-export from the chat folder
export { 
  getCurrentQuestion,
  isMultiSelectQuestion,
  getSectionTitle,
  getTotalSectionsForRole,
  getFieldTypeForQuestion
} from './chat/utils/questionUtils';

export {
  isEndOfSection,
  isEndOfFlow,
  generateSectionTransitionMessage,
  calculateOverallQuestionIndex,
  extractSectionAndQuestionIndices
} from './chat/utils/navigationUtils';

export {
  generateNextQuestionMessage
} from './chat/utils/messageGenerationUtils';

export {
  generateDataSummary
} from './chat/utils/summaryUtils';

// Export validation utilities
export { validateChatInput } from './chat/utils/inputValidation';

// Export multi-selection utilities
export {
  useMultiSelectionStore,
  setMultiSelectionMode,
  getMultiSelectionStatus,
  addToMultiSelection,
  removeFromMultiSelection,
  completeMultiSelection
} from './chat/utils/multiSelectionManager';

// Export progress management utilities
export {
  updateChatProgress,
  saveChatResponse,
  getSessionResponses
} from './chat/utils/progressManager';
