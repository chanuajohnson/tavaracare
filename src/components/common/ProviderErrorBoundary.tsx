import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ProviderErrorBoundaryProps {
  children: React.ReactNode;
  providerName: string;
}

export const ProviderErrorBoundary: React.FC<ProviderErrorBoundaryProps> = ({ 
  children, 
  providerName 
}) => {
  const handleProviderError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`[PROVIDER-ERROR] ${providerName} failed:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      provider: providerName,
      timestamp: new Date().toISOString()
    });

    // Clear provider-specific state if applicable
    if (providerName === 'AuthProvider') {
      try {
        localStorage.removeItem('authStateError');
        localStorage.removeItem('authTimeoutRecovery');
        sessionStorage.removeItem('TAVARA_REDIRECT_LOCK');
      } catch (e) {
        console.error('Failed to clear auth state:', e);
      }
    }
  };

  const providerFallback = (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold text-destructive">Service Unavailable</h2>
        <p className="text-muted-foreground">
          The {providerName} service is currently unavailable. 
          Please refresh the page to try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      level="provider"
      name={providerName}
      onError={handleProviderError}
      fallback={providerFallback}
    >
      {children}
    </ErrorBoundary>
  );
};