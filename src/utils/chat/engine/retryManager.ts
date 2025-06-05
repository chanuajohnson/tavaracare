import { RetryState } from './types';

// Keep track of retry attempts per session
const retryStates = new Map<string, RetryState>();

// Get or initialize retry state for a session
export const getRetryState = (sessionId: string): RetryState => {
  if (!retryStates.has(sessionId)) {
    retryStates.set(sessionId, { count: 0, lastError: null });
  }
  return retryStates.get(sessionId)!;
};

// Reset retry state for a session
export const resetRetryState = (sessionId: string): void => {
  retryStates.set(sessionId, { count: 0, lastError: null });
};
