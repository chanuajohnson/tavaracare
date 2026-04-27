import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useLocation } from 'react-router-dom';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children }) => {
  const location = useLocation();

  const handleRouteError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[ROUTE-ERROR] Page failed to load:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      route: location.pathname,
      search: location.search,
      timestamp: new Date().toISOString()
    });

    // Track route-specific errors
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Route Error: ${location.pathname} - ${error.message}`,
        fatal: false
      });
    }
  };

  return (
    <ErrorBoundary
      level="route"
      name={`Route: ${location.pathname}`}
      onError={handleRouteError}
      showReportButton={false}
    >
      {children}
    </ErrorBoundary>
  );
};