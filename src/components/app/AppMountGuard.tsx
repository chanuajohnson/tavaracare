
import React, { useState, useEffect } from 'react';
import { isModuleReady } from '@/utils/moduleInitTracker';
import { BootPhase, getCurrentPhase, isPhaseReady } from '@/utils/appBootstrap';

interface AppMountGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AppMountGuard ensures React is fully initialized before rendering children
 * This prevents "forwardRef is not a function" errors during initialization
 */
export function AppMountGuard({ children, fallback }: AppMountGuardProps) {
  const [appReady, setAppReady] = useState(false);
  const [showingFallback, setShowingFallback] = useState(true);
  
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
        return true;
      }
      return false;
    };
    
    // Check if our app is in the right phase
    const checkAppStatus = () => {
      if (isModuleReady('react') && isPhaseReady(BootPhase.BASIC_REACT)) {
        setShowingFallback(false);
        return true;
      }
      return false;
    };
    
    // Check if all modules are ready for full rendering
    const checkFullAppStatus = () => {
      if (isModuleReady('app') && isPhaseReady(BootPhase.FULL_APP)) {
        setAppReady(true);
        return true;
      }
      return false;
    };

    // Try immediately
    if (checkReactStatus() && checkAppStatus()) {
      checkFullAppStatus();
      return;
    }
    
    // If not ready, set up a polling mechanism with exponential backoff
    let attempt = 0;
    const maxAttempts = 10;
    
    const checkInterval = setInterval(() => {
      attempt++;
      
      // First check if React is ready
      if (checkReactStatus()) {
        // Then check if we're at least in BASIC_REACT phase
        if (checkAppStatus()) {
          // Finally check if the full app is ready
          if (checkFullAppStatus() || attempt >= maxAttempts) {
            clearInterval(checkInterval);
            
            if (attempt >= maxAttempts && !appReady) {
              console.error('[AppMountGuard] Maximum initialization attempts reached');
              console.log('[AppMountGuard] Continuing with partial initialization status');
              
              // Even with max attempts, we'll try to render the app if React is available
              if (checkReactStatus()) {
                setShowingFallback(false);
                setTimeout(() => setAppReady(true), 1000); // Give it a final chance
              } else {
                // Force a page reload as last resort
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }
            }
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

  // Start with HTML-only fallback
  if (showingFallback) {
    return <>{fallback || defaultFallback}</>;
  }

  // Then show children when initialized
  return <>{children}</>;
}
