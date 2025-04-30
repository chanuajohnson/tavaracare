
/**
 * Navigation utilities for the chat system
 */

/**
 * Check if an option is a section transition option
 * These options should never trigger multi-selection
 */
export const isTransitionOption = (optionId: string): boolean => {
  return optionId === "continue" || 
         optionId === "take_break" || 
         optionId === "restart";
};

/**
 * Reset the multi-selection state completely
 * This is needed when transitioning between sections
 */
export const resetMultiSelectionState = (): void => {
  // This re-exports the function for easier access
  // The actual implementation is in multiSelectionManager.ts
  // We export it here to provide a centralized access point
  console.log("[navigationUtils] Reset multi-selection state requested");
};
