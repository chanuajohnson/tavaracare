
/**
 * Utility to help detect and handle React initialization issues
 */

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
    return false;
  }

  // Verify basic React functionality
  try {
    // Test basic React functionality
    const testElement = window.React.createElement('div', null, 'Test');
    if (!testElement || typeof testElement !== 'object') {
      console.error('[reactErrorHandler] React createElement test failed, returned:', testElement);
      return false;
    }
    
    // Check if forwardRef is available
    if (!window.React.forwardRef || typeof window.React.forwardRef !== 'function') {
      console.error('[reactErrorHandler] React.forwardRef is not available or not a function');
      return false;
    }

    // Check if Suspense is available (needed for lazy loading)
    if (!window.React.Suspense) {
      console.error('[reactErrorHandler] React.Suspense is not available');
      return false;
    }
    
    // Log a successful initialization
    console.log('[reactErrorHandler] React initialization check passed');
    
    // Mark React as initialized if not already done
    if (window.reactInitialized !== true) {
      console.log('[reactErrorHandler] Setting reactInitialized flag to true');
      window.reactInitialized = true;
    }
    
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
      if (typeof window !== 'undefined' && window.React && window.reactInitialized === true) {
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
  
  const status = {
    hasReactObject: !!window.React,
    forwardRefType: typeof window.React?.forwardRef,
    createElementType: typeof window.React?.createElement,
    initializationFlag: !!window.reactInitialized,
    canRenderComponents: canRenderReactComponent()
  };
  
  console.log('[React Status]', status);
  return status;
};
