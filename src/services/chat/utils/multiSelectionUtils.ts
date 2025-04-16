// Global state for multi-selection
let multiSelectionState = {
  active: false,
  selections: [] as string[]
};

/**
 * Get the current multi-selection status
 */
export const getMultiSelectionStatus = () => {
  return { ...multiSelectionState };
};

/**
 * Set multi-selection mode
 */
export const setMultiSelectionMode = (active: boolean, initialSelections: string[] = []) => {
  multiSelectionState = {
    active,
    selections: initialSelections
  };
};

/**
 * Add an option to the multi-selection
 * Returns the updated selections array
 */
export const addToMultiSelection = (optionId: string): string[] => {
  // If the option is already selected, remove it
  if (multiSelectionState.selections.includes(optionId)) {
    multiSelectionState.selections = multiSelectionState.selections.filter(id => id !== optionId);
  } else {
    // Otherwise add it
    multiSelectionState.selections.push(optionId);
  }
  
  return [...multiSelectionState.selections];
};

/**
 * Complete the multi-selection process
 * Returns the final selections array and resets the state
 */
export const completeMultiSelection = (): string[] => {
  const selections = [...multiSelectionState.selections];
  
  // Reset the state
  multiSelectionState = {
    active: false,
    selections: []
  };
  
  return selections;
};
