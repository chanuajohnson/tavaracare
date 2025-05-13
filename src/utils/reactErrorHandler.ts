
/**
 * Utility to help detect and handle React initialization issues
 */

// Check if React is properly initialized
export const ensureReact = () => {
  if (typeof window === 'undefined') {
    console.log('[reactErrorHandler] Running in SSR/build mode');
    return;
  }

  // Check if React is available
  if (!window.React) {
    console.error('[reactErrorHandler] React not found in global scope');
    throw new Error('React initialization failed: React not found in global scope');
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
    throw new Error('React initialization failed: createElement test failed');
  }

  console.log('[reactErrorHandler] React initialization check passed');
};

// Create an error boundary function to wrap components
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    try {
      return window.React.createElement(Component, props);
    } catch (error) {
      console.error('[reactErrorHandler] Component error:', error);
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
  };
};
