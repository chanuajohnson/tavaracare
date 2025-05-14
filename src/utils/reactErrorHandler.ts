
/**
 * Utility to help detect and handle React initialization issues
 */

// Check if React is properly initialized
export const ensureReact = () => {
  if (typeof window === 'undefined') {
    console.log('[reactErrorHandler] Running in SSR/build mode');
    return;
  }

  // Add some debug information about the state of React
  console.log('[reactErrorHandler] Checking React availability');
  console.log('[reactErrorHandler] window.React:', !!window.React);
  console.log('[reactErrorHandler] window.reactInitialized:', !!window.reactInitialized);

  // Check if React is available
  if (!window.React) {
    console.error('[reactErrorHandler] React not found in global scope');
    
    // Try to recover by waiting a bit
    return new Promise((resolve) => {
      console.log('[reactErrorHandler] Attempting recovery, waiting for React...');
      
      let attempts = 0;
      const checkReact = () => {
        attempts++;
        if (window.React) {
          console.log(`[reactErrorHandler] React found after ${attempts} attempts`);
          resolve(true);
        } else if (attempts < 5) {
          console.log(`[reactErrorHandler] React still not found, attempt ${attempts}`);
          setTimeout(checkReact, 100);
        } else {
          console.error('[reactErrorHandler] Failed to find React after multiple attempts');
          resolve(false);
        }
      };
      
      setTimeout(checkReact, 100);
    });
  }

  // Verify basic React functionality
  const testReact = () => {
    try {
      // Test basic React functionality
      const testElement = window.React.createElement('div', null, 'Test');
      if (!testElement || typeof testElement !== 'object') {
        console.error('[reactErrorHandler] React createElement test failed');
        return false;
      }
      return true;
    } catch (error) {
      console.error('[reactErrorHandler] Error testing React:', error);
      return false;
    }
  };

  if (!testReact()) {
    console.error('[reactErrorHandler] React test failed, waiting for initialization...');
    return false;
  }

  console.log('[reactErrorHandler] React initialization check passed');
  return true;
};

// Create an error boundary function to wrap components
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    try {
      // Only proceed if React is available
      if (typeof window !== 'undefined' && window.React) {
        return window.React.createElement(Component, props);
      } else {
        // Return loading placeholder if React isn't ready
        console.error('[reactErrorHandler] React not available for component rendering');
        return null;
      }
    } catch (error) {
      console.error('[reactErrorHandler] Component error:', error);
      // Only create error UI if React is available
      if (typeof window !== 'undefined' && window.React) {
        return window.React.createElement('div', { 
          style: { 
            color: 'red',
            padding: '16px',
            border: '1px solid red',
            borderRadius: '4px',
            margin: '8px 0'
          }
        }, 'Component Error: ' + (error instanceof Error ? error.message : String(error)));
      }
      return null;
    }
  };
};
