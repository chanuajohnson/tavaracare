import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorReportData {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  userId?: string;
  context?: Record<string, any>;
}

export const useGlobalErrorHandler = () => {
  // Global error handler for unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[GLOBAL-ERROR] Unhandled error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString()
      });

      // Show user-friendly error message
      toast.error('An unexpected error occurred. Please try again.');

      // Report to analytics if available
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: `Global Error: ${event.message}`,
          fatal: false
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[GLOBAL-ASYNC-ERROR] Unhandled promise rejection:', {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString()
      });

      // Show user-friendly error message for API failures
      if (event.reason?.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }

      // Report to analytics if available
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: `Async Error: ${event.reason?.message || 'Unknown async error'}`,
          fatal: false
        });
      }
    };

    // Add global error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Function to manually report errors
  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorData: ErrorReportData = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      context
    };

    console.error('[MANUAL-ERROR-REPORT]', errorData);

    // In a real app, this would send to an error reporting service
    // For now, we'll just log and show a toast
    toast.error('Error reported. Thank you for helping us improve!');

    return errorData;
  }, []);

  // Function to handle API errors gracefully
  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`[API-ERROR] ${operation} failed:`, error);

    if (error?.message?.includes('fetch')) {
      toast.error('Network error. Please check your connection.');
    } else if (error?.status === 401) {
      toast.error('Session expired. Please sign in again.');
    } else if (error?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(`Failed to ${operation}. Please try again.`);
    }

    return error;
  }, []);

  return {
    reportError,
    handleApiError
  };
};