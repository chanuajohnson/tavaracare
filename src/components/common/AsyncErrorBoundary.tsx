import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  name?: string;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ 
  children, 
  name = 'Async Component' 
}) => {
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  // Reset async error when children change
  useEffect(() => {
    setAsyncError(null);
  }, [children]);

  // Global async error handler
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[ASYNC-ERROR] Unhandled promise rejection:', event.reason);
      
      // Only capture if it's an Error object
      if (event.reason instanceof Error) {
        setAsyncError(event.reason);
        event.preventDefault(); // Prevent console error
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleAsyncError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[ASYNC-BOUNDARY] Async operation failed:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      component: name,
      timestamp: new Date().toISOString()
    });
  };

  // If we have an async error, throw it to be caught by ErrorBoundary
  if (asyncError) {
    throw asyncError;
  }

  return (
    <ErrorBoundary
      level="component"
      name={`${name} (Async)`}
      onError={handleAsyncError}
    >
      {children}
    </ErrorBoundary>
  );
};

// Hook for components to report async errors
export const useAsyncErrorHandler = () => {
  const [, setError] = useState<Error | null>(null);

  const handleAsyncError = (error: Error) => {
    console.error('[ASYNC-HANDLER] Async error reported:', error);
    setError(() => {
      throw error; // This will be caught by the nearest ErrorBoundary
    });
  };

  return { handleAsyncError };
};