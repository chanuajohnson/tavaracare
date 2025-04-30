
/**
 * Navigation utilities for the chat system
 */

// Import from multiSelectionManager to avoid duplication
import { resetMultiSelectionState as resetMultiSelect, isTransitionOption as checkTransitionOption } from "../../../../services/chat/utils/multiSelectionManager";

/**
 * Check if an option is a section transition option
 * These options should never trigger multi-selection
 * Re-exports the function from multiSelectionManager for consistency
 */
export const isTransitionOption = checkTransitionOption;

/**
 * Reset the multi-selection state completely
 * This is needed when transitioning between sections
 * Re-exports the function from multiSelectionManager for consistency
 */
export const resetMultiSelectionState = (): void => {
  // This re-exports the function for easier access
  // The actual implementation is in multiSelectionManager.ts
  console.log("[navigationUtils] Reset multi-selection state requested");
  resetMultiSelect();
};
