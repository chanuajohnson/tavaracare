
/**
 * Utilities for managing multi-selection state in the chatbot
 */

// State for multi-selection
let multiSelectionInProgress = false;
let currentSelectedOptions: string[] = [];

/**
 * Sets the multi-selection mode 
 */
export const setMultiSelectionMode = (isActive: boolean, initialSelections: string[] = []) => {
  multiSelectionInProgress = isActive;
  currentSelectedOptions = initialSelections;
};

/**
 * Gets the current status of multi-selection
 */
export const getMultiSelectionStatus = () => {
  return {
    active: multiSelectionInProgress,
    selections: currentSelectedOptions
  };
};

/**
 * Adds an option to the multi-selection
 */
export const addToMultiSelection = (option: string) => {
  if (!currentSelectedOptions.includes(option)) {
    currentSelectedOptions.push(option);
  }
  return [...currentSelectedOptions];
};

/**
 * Removes an option from the multi-selection
 */
export const removeFromMultiSelection = (option: string) => {
  currentSelectedOptions = currentSelectedOptions.filter(item => item !== option);
  return [...currentSelectedOptions];
};

/**
 * Completes the multi-selection and returns final selections
 */
export const completeMultiSelection = () => {
  const selections = [...currentSelectedOptions];
  multiSelectionInProgress = false;
  currentSelectedOptions = [];
  return selections;
};
