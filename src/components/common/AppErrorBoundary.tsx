import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log critical app-level errors
    console.error('[APP-CRITICAL] Application-level error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Clear potentially corrupted state
    try {
      localStorage.removeItem('tavara_chat_is_open');
      localStorage.removeItem('tavara_chat_initial_role');
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }

    // Report to error tracking if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `App Error: ${error.message}`,
        fatal: true
      });
    }
  };

  return (
    <ErrorBoundary
      level="app"
      name="Application"
      onError={handleAppError}
      showReportButton={true}
    >
      {children}
    </ErrorBoundary>
  );
};