
/**
 * This utility helps detect and recover from React initialization errors
 */

// Check if React is available and properly initialized
export function checkReactInitialization() {
  if (typeof window === 'undefined') return false;
  
  // Check if React is available in global scope
  if (!window.React) {
    console.error('[ReactErrorHandler] React not found in global scope');
    return false;
  }
  
  // Check if critical React methods are available
  try {
    // Test React functionality rather than just its presence
    const testElement = window.React.createElement('div', null, 'Test');
    if (!testElement || testElement.type !== 'div') {
      console.error('[ReactErrorHandler] React createElement not working properly');
      return false;
    }
    return true;
  } catch (error) {
    console.error('[ReactErrorHandler] Error checking React functionality:', error);
    return false;
  }
}

// Try to recover from React initialization issues
export function attemptReactRecovery() {
  try {
    // Dynamic import of React as a recovery mechanism
    import('react').then(ReactModule => {
      console.log('[ReactErrorHandler] Successfully imported React module for recovery');
      
      // Ensure React is available globally
      if (typeof window !== 'undefined') {
        window.React = ReactModule.default || ReactModule;
        window.reactInitialized = true;
        
        console.log('[ReactErrorHandler] React recovery attempted, reloading application...');
        // Give a short delay before reload to allow logs to be seen
        setTimeout(() => window.location.reload(), 1000);
      }
    }).catch(error => {
      console.error('[ReactErrorHandler] Failed to dynamically import React:', error);
    });
  } catch (error) {
    console.error('[ReactErrorHandler] Recovery attempt failed:', error);
  }
}

// Main recovery function to be called from application bootstrap
export function ensureReact() {
  const isReactInitialized = checkReactInitialization();
  
  if (!isReactInitialized) {
    console.warn('[ReactErrorHandler] React initialization issue detected, attempting recovery');
    attemptReactRecovery();
    return false;
  }
  
  return true;
}
