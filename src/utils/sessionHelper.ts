
import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'tavara_session_id';

/**
 * Generates or retrieves a persistent session ID for the current user
 * This allows tracking anonymous users before they create accounts
 */
export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
};

/**
 * Get basic device/browser information for analytics
 */
export const getDeviceInfo = (): Record<string, any> => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Detect user exit intent (mouse movement to top of page)
 */
export const detectExitIntent = (callback: () => void): () => void => {
  const handleMouseLeave = (e: MouseEvent) => {
    // Exit intent is detected when mouse moves above the top edge of the page
    if (e.clientY <= 5) {
      callback();
    }
  };
  
  document.addEventListener('mouseleave', handleMouseLeave);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * Calculate estimated time to complete a form based on remaining fields
 */
export const calculateEstimatedTimeRemaining = (totalTimeSeconds: number, progress: number): number => {
  return Math.round(totalTimeSeconds * (1 - progress / 100));
};

/**
 * Format seconds into a human-readable time string
 */
export const formatTimeEstimate = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
};
