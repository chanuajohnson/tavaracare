
// Legacy service file - replaced by TAV system
// Kept for backward compatibility

export const getCurrentQuestion = () => {
  console.warn('getCurrentQuestion is deprecated - replaced by TAV system');
  return null;
};

export const isMultiSelectQuestion = () => {
  console.warn('isMultiSelectQuestion is deprecated - replaced by TAV system');
  return false;
};

export const getSectionTitle = () => {
  console.warn('getSectionTitle is deprecated - replaced by TAV system');
  return '';
};

export const getTotalSectionsForRole = () => {
  console.warn('getTotalSectionsForRole is deprecated - replaced by TAV system');
  return 0;
};

export const isEndOfSection = () => {
  console.warn('isEndOfSection is deprecated - replaced by TAV system');
  return false;
};

export const isEndOfFlow = () => {
  console.warn('isEndOfFlow is deprecated - replaced by TAV system');
  return false;
};

export const generateNextQuestionMessage = () => {
  console.warn('generateNextQuestionMessage is deprecated - replaced by TAV system');
  return '';
};

export const generateDataSummary = () => {
  console.warn('generateDataSummary is deprecated - replaced by TAV system');
  return '';
};

export const validateChatInput = () => {
  console.warn('validateChatInput is deprecated - replaced by TAV system');
  return { isValid: true, message: '' };
};

export const setMultiSelectionMode = () => {
  console.warn('setMultiSelectionMode is deprecated - replaced by TAV system');
};

export const getMultiSelectionStatus = () => {
  console.warn('getMultiSelectionStatus is deprecated - replaced by TAV system');
  return { isActive: false, selectedOptions: [] };
};

export const addToMultiSelection = () => {
  console.warn('addToMultiSelection is deprecated - replaced by TAV system');
};

export const removeFromMultiSelection = () => {
  console.warn('removeFromMultiSelection is deprecated - replaced by TAV system');
};

export const completeMultiSelection = () => {
  console.warn('completeMultiSelection is deprecated - replaced by TAV system');
};

export const resetMultiSelectionState = () => {
  console.warn('resetMultiSelectionState is deprecated - replaced by TAV system');
};

export const isTransitionOption = () => {
  console.warn('isTransitionOption is deprecated - replaced by TAV system');
  return false;
};

export const updateChatProgress = () => {
  console.warn('updateChatProgress is deprecated - replaced by TAV system');
};

export const saveChatResponse = () => {
  console.warn('saveChatResponse is deprecated - replaced by TAV system');
};

export const getSessionResponses = () => {
  console.warn('getSessionResponses is deprecated - replaced by TAV system');
  return [];
};
