/**
 * Utility to help detect and handle React initialization issues
 */
import { registerModuleError, registerModuleInit } from './moduleInitTracker';
import { registerReactReady, BootPhase, getCurrentPhase } from './appBootstrap';

// Define error types to track sources of initialization failures
enum ReactErrorType {
  MISSING_REACT = 'missing_react',
  MISSING_FORWARD_REF = 'missing_forward_ref',
  MISSING_CREATE_ELEMENT = 'missing_create_element',
  TEST_FAILURE = 'test_failure',
  GENERAL_ERROR = 'general_error',
}

// Check if React is properly initialized
export const ensureReact = () => {
  if (typeof window === 'undefined') {
    console.log('[reactErrorHandler] Running in SSR/build mode');
    return false;
  }

  // Add detailed diagnostics about React initialization
  console.log('[reactErrorHandler] Checking React availability');
  console.log('[reactErrorHandler] window.React:', !!window.React);
  console.log('[reactErrorHandler] window.reactInitialized:', !!window.reactInitialized);
  
  if (window.React) {
    console.log('[reactErrorHandler] React.forwardRef type:', typeof window.React.forwardRef);
    console.log('[reactErrorHandler] React.createElement type:', typeof window.React.createElement);
    console.log('[reactErrorHandler] React.Suspense available:', !!window.React.Suspense);
  }

  // Check if React is available and has necessary methods
  if (!window.React) {
    console.error('[reactErrorHandler] React not found in global scope');
    registerModuleError('react', new Error(ReactErrorType.MISSING_REACT));
    triggerEmergencyRecovery(ReactErrorType.MISSING_REACT);
    return false;
  }

  // Verify basic React functionality
  try {
    // Check if forwardRef is available
    if (!window.React.forwardRef || typeof window.React.forwardRef !== 'function') {
      console.error('[reactErrorHandler] React.forwardRef is not available or not a function');
      registerModuleError('react', new Error(ReactErrorType.MISSING_FORWARD_REF));
      triggerEmergencyRecovery(ReactErrorType.MISSING_FORWARD_REF);
      return false;
    }

    // Check if createElement is available
    if (!window.React.createElement || typeof window.React.createElement !== 'function') {
      console.error('[reactErrorHandler] React.createElement is not available or not a function');
      registerModuleError('react', new Error(ReactErrorType.MISSING_CREATE_ELEMENT));
      triggerEmergencyRecovery(ReactErrorType.MISSING_CREATE_ELEMENT);
      return false;
    }

    // Test basic React functionality
    const testElement = window.React.createElement('div', null, 'Test');
    if (!testElement || typeof testElement !== 'object') {
      console.error('[reactErrorHandler] React createElement test failed, returned:', testElement);
      registerModuleError('react', new Error(ReactErrorType.TEST_FAILURE));
      triggerEmergencyRecovery(ReactErrorType.TEST_FAILURE);
      return false;
    }

    // Check if Suspense is available (needed for lazy loading)
    if (!window.React.Suspense) {
      console.error('[reactErrorHandler] React.Suspense is not available');
      registerModuleError('react', new Error('React.Suspense is not available'));
      // This is non-critical, continue initialization
    }
    
    // Log a successful initialization
    console.log('[reactErrorHandler] React initialization check passed');
    
    // Mark React as initialized if not already done
    if (window.reactInitialized !== true) {
      console.log('[reactErrorHandler] Setting reactInitialized flag to true');
      window.reactInitialized = true;
      window.dispatchEvent(new Event('ReactInitialized'));
      registerReactReady();
    }
    
    // Register with module tracker
    registerModuleInit('react');
    
    return true;
  } catch (error) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    console.error('[reactErrorHandler] Error testing React:', typedError);
    registerModuleError('react', typedError);
    triggerEmergencyRecovery(ReactErrorType.GENERAL_ERROR);
    return false;
  }
};

// Trigger emergency recovery procedures
const triggerEmergencyRecovery = (errorType: ReactErrorType) => {
  console.warn(`[reactErrorHandler] Triggering emergency recovery for error type: ${errorType}`);
  
  // Log the error to window for debugging
  if (typeof window !== 'undefined') {
    window._initLogs = window._initLogs || [];
    window._initLogs.push({
      timestamp: new Date().toISOString(),
      errorType,
      phase: getCurrentPhase(),
      recovery: 'triggered'
    });
    
    // Dispatch event for any listeners
    window.dispatchEvent(new CustomEvent('ReactInitFailed', { 
      detail: { errorType, timestamp: Date.now() } 
    }));
    
    // Set a timeout to reload the page if React doesn't initialize
    // Only do this if we haven't already set up a reload
    if (!window._reactRecoveryTimeout) {
      window._reactRecoveryTimeout = setTimeout(() => {
        console.error('[reactErrorHandler] React initialization failed, reloading page...');
        
        // One final attempt at forcing React initialization before reload
        if (window.React && typeof window.React.forwardRef === 'function') {
          window.reactInitialized = true;
          window.dispatchEvent(new Event('ReactInitialized'));
          console.log('[reactErrorHandler] Last-second React recovery successful!');
          return; // Cancel the reload if we recovered
        }
        
        // If we got here, reload the page
        window.location.reload();
      }, 5000); // Wait 5 seconds before forcing reload
    }
  }
};

// Create a utility to wait for React to be fully initialized
export const waitForReactReady = (timeout = 5000): Promise<boolean> => {
  return new Promise(resolve => {
    // If React is already ready, resolve immediately
    if (canRenderReactComponent()) {
      resolve(true);
      return;
    }
    
    // Otherwise, set up polling with exponential backoff
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 100; // Start with 100ms
    
    const check = () => {
      attempts++;
      
      // Check if React is ready
      if (canRenderReactComponent()) {
        console.log(`[reactErrorHandler] React ready after ${attempts} attempts`);
        resolve(true);
        return;
      }
      
      // If we've tried too many times, give up
      if (attempts >= maxAttempts || attempts * checkInterval >= timeout) {
        console.warn(`[reactErrorHandler] Timeout waiting for React after ${attempts} attempts`);
        resolve(false);
        return;
      }
      
      // Try again with exponential backoff
      const nextInterval = checkInterval * Math.pow(1.5, attempts);
      setTimeout(check, nextInterval);
    };
    
    // Also listen for the event in case React initializes between checks
    if (typeof window !== 'undefined') {
      window.addEventListener('ReactInitialized', () => {
        console.log('[reactErrorHandler] Caught ReactInitialized event');
        resolve(true);
      }, { once: true });
    }
    
    // Start checking
    check();
  });
};

// Create an error boundary function to wrap components
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    try {
      // Only proceed if React is available and initialized
      if (canRenderReactComponent()) {
        return window.React.createElement(Component, props);
      } else {
        // Return loading placeholder if React isn't ready
        console.error('[reactErrorHandler] React not available for component rendering');
        
        // Return a simple div to not depend on React
        if (typeof document !== 'undefined') {
          const placeholder = document.createElement('div');
          placeholder.textContent = 'Loading...';
          placeholder.style.padding = '8px';
          return placeholder;
        }
        return null;
      }
    } catch (error) {
      console.error('[reactErrorHandler] Component error:', error);
      
      // Create a simple error UI element without depending on React
      if (typeof document !== 'undefined') {
        const errorElement = document.createElement('div');
        errorElement.textContent = 'Error: ' + (error instanceof Error ? error.message : String(error));
        errorElement.style.color = 'red';
        errorElement.style.padding = '8px';
        errorElement.style.border = '1px solid red';
        return errorElement;
      }
      return null;
    }
  };
};

// Helper to safely check if a component can be rendered
export const canRenderReactComponent = () => {
  if (typeof window === 'undefined') return false;
  
  // Comprehensive check for React availability
  try {
    // Quick check for basic React availability
    if (!window.React || typeof window.React.createElement !== 'function' || 
        typeof window.React.forwardRef !== 'function') {
      return false;
    }
    
    // Test createElement functionality
    const testEl = window.React.createElement('div', null);
    if (!testEl || typeof testEl !== 'object') {
      return false;
    }
    
    // Deeper check with reactInitialized flag
    return window.reactInitialized === true;
  } catch (error) {
    console.error('[reactErrorHandler] Error in canRenderReactComponent:', error);
    return false;
  }
};

// Export a utility to log React initialization status
export const logReactStatus = () => {
  if (typeof window === 'undefined') {
    return 'SSR mode';
  }
  
  const currentBootPhase = getCurrentPhase();
  
  const status = {
    bootPhase: currentBootPhase,
    hasReactObject: !!window.React,
    forwardRefType: typeof window.React?.forwardRef,
    createElementType: typeof window.React?.createElement,
    initializationFlag: !!window.reactInitialized,
    canRenderComponents: canRenderReactComponent()
  };
  
  console.log('[React Status]', status);
  return status;
};
