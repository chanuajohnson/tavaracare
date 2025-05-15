
/**
 * Utility to help detect and handle React initialization issues
 */

// Check if React is properly initialized
export const ensureReact = () => {
  if (typeof window === 'undefined') {
    console.log('[reactErrorHandler] Running in SSR/build mode');
    return false;
  }

  // Add some debug information about the state of React
  console.log('[reactErrorHandler] Checking React availability');
  console.log('[reactErrorHandler] window.React:', !!window.React);
  console.log('[reactErrorHandler] window.reactInitialized:', !!window.reactInitialized);

  // Check if React is available and has necessary methods
  if (!window.React) {
    console.error('[reactErrorHandler] React not found in global scope');
    return false;
  }

  // Verify basic React functionality
  try {
    // Test basic React functionality
    const testElement = window.React.createElement('div', null, 'Test');
    if (!testElement || typeof testElement !== 'object') {
      console.error('[reactErrorHandler] React createElement test failed');
      return false;
    }
    
    // Check if forwardRef is available
    if (!window.React.forwardRef) {
      console.error('[reactErrorHandler] React.forwardRef is not available');
      return false;
    }

    // Check if Suspense is available (needed for lazy loading)
    if (!window.React.Suspense) {
      console.error('[reactErrorHandler] React.Suspense is not available');
      return false;
    }
    
    console.log('[reactErrorHandler] React initialization check passed');
    return true;
  } catch (error) {
    console.error('[reactErrorHandler] Error testing React:', error);
    return false;
  }
};

// Create an error boundary function to wrap components
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    try {
      // Only proceed if React is available and initialized
      if (typeof window !== 'undefined' && window.React && window.reactInitialized) {
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

// Helper to safely check if a component can be rendered
export const canRenderReactComponent = () => {
  if (typeof window === 'undefined') return false;
  
  // Quick check for basic React availability
  if (!window.React || !window.React.createElement || !window.React.forwardRef) {
    return false;
  }
  
  // Deeper check with reactInitialized flag
  return window.reactInitialized === true;
};
