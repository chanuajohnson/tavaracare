import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ProviderErrorBoundaryProps {
  children: React.ReactNode;
  providerName: string;
}

// Errors that are typically transient (network / edge function blips) and should
// auto-recover instead of replacing the whole page with a red "Service Unavailable".
const TRANSIENT_ERROR_PATTERNS = [
  'FunctionsFetchError',
  'Failed to send a request to the Edge Function',
  'Failed to fetch',
  'NetworkError',
  'Load failed',
];

const isTransientError = (error: Error): boolean => {
  const message = `${error?.name ?? ''} ${error?.message ?? ''}`;
  return TRANSIENT_ERROR_PATTERNS.some((p) => message.includes(p));
};

const MAX_AUTO_RETRIES = 3;
const RETRY_DELAY_MS = 600;

export const ProviderErrorBoundary: React.FC<ProviderErrorBoundaryProps> = ({
  children,
  providerName,
}) => {
  // resetKey forces the inner ErrorBoundary + subtree to remount on retry.
  const [resetKey, setResetKey] = useState(0);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleProviderError = useCallback(
    (error: Error, errorInfo: React.ErrorInfo) => {
      console.error(`[PROVIDER-ERROR] ${providerName} failed:`, {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        provider: providerName,
        retryCount: retryCountRef.current,
        transient: isTransientError(error),
        timestamp: new Date().toISOString(),
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

      // Auto-recover from transient network / edge-function errors so the page
      // does not get replaced by a hard "Service Unavailable" screen.
      if (isTransientError(error) && retryCountRef.current < MAX_AUTO_RETRIES) {
        retryCountRef.current += 1;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setResetKey((k) => k + 1);
        }, RETRY_DELAY_MS * retryCountRef.current);
      }
    },
    [providerName],
  );

  const providerFallback = (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
        <p className="text-muted-foreground">
          We hit a temporary issue loading this page. Refreshing usually fixes it.
        </p>
        <button
          onClick={() => {
            retryCountRef.current = 0;
            setResetKey((k) => k + 1);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      key={resetKey}
      level="provider"
      name={providerName}
      onError={handleProviderError}
      fallback={providerFallback}
    >
      {children}
    </ErrorBoundary>
  );
};
