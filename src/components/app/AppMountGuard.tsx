
import React, { useState, useEffect } from 'react';

interface AppMountGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AppMountGuard ensures React is fully initialized before rendering children
 * This prevents "forwardRef is not a function" errors during initialization
 */
export function AppMountGuard({ children, fallback }: AppMountGuardProps) {
  const [reactIsReady, setReactIsReady] = useState(false);
  
  useEffect(() => {
    // Check if React is fully initialized
    const checkReactStatus = () => {
      if (
        typeof window !== 'undefined' && 
        window.React && 
        typeof window.React.forwardRef === 'function' &&
        window.reactInitialized === true
      ) {
        console.log('[AppMountGuard] React is fully initialized');
        setReactIsReady(true);
        return true;
      }
      return false;
    };

    // Try immediately
    if (checkReactStatus()) return;
    
    // If not ready, set up a polling mechanism with exponential backoff
    let attempt = 0;
    const maxAttempts = 10;
    
    const checkInterval = setInterval(() => {
      attempt++;
      if (checkReactStatus() || attempt >= maxAttempts) {
        clearInterval(checkInterval);
        
        if (attempt >= maxAttempts && !reactIsReady) {
          console.error('[AppMountGuard] Maximum initialization attempts reached');
          // Force a page reload as last resort
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }
      }
    }, 100 * Math.pow(2, Math.min(attempt, 5))); // Exponential backoff up to 32x the base time
    
    return () => clearInterval(checkInterval);
  }, []);

  // Default fallback loading UI with Tavara branding
  const defaultFallback = (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-muted-foreground">Loading Tavara...</p>
    </div>
  );

  return reactIsReady ? <>{children}</> : (fallback || defaultFallback);
}
