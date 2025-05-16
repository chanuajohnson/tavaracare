
import React, { useState, useEffect, useRef } from 'react';
import { isModuleReady } from '@/utils/moduleInitTracker';
import { BootPhase, getCurrentPhase, isPhaseReady, waitForPhase } from '@/utils/appBootstrap';
import { waitForReactReady, canRenderReactComponent } from '@/utils/reactErrorHandler';

interface AppMountGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPhase?: BootPhase;
  timeout?: number;
}

/**
 * AppMountGuard ensures React is fully initialized before rendering children
 * This prevents "forwardRef is not a function" errors during initialization
 */
export function AppMountGuard({ 
  children, 
  fallback, 
  requiredPhase = BootPhase.BASIC_REACT,
  timeout = 10000
}: AppMountGuardProps) {
  const [appReady, setAppReady] = useState(false);
  const [showingFallback, setShowingFallback] = useState(true);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  useEffect(() => {
    let timeoutId: number;
    let recoveryId: number;
    let checkInterval: number;

    // Function to check if React is fully initialized
    const checkReactStatus = () => {
      if (!mountedRef.current) return false;
      
      if (
        typeof window !== 'undefined' && 
        window.React && 
        typeof window.React.forwardRef === 'function' &&
        window.reactInitialized === true
      ) {
        console.log('[AppMountGuard] React is fully initialized');
        return true;
      }
      
      console.log('[AppMountGuard] React not yet ready:', {
        hasReact: typeof window !== 'undefined' && !!window.React,
        hasForwardRef: typeof window !== 'undefined' && typeof window.React?.forwardRef === 'function',
        initialized: typeof window !== 'undefined' && !!window.reactInitialized
      });
      
      return false;
    };
    
    // Check if our app is in the right phase
    const checkAppStatus = () => {
      if (!mountedRef.current) return false;
      
      const phaseReady = isPhaseReady(requiredPhase);
      const moduleReady = isModuleReady('react');
      
      if (phaseReady && moduleReady) {
        // Safe transition by ensuring the old DOM is removed completely
        if (showingFallback) {
          console.log('[AppMountGuard] Transitioning from fallback to app content');
          // Ensure safe transition by using a slight delay
          setTimeout(() => {
            if (mountedRef.current) {
              setShowingFallback(false);
            }
          }, 10);
        }
        return true;
      }
      
      console.log('[AppMountGuard] App not yet ready:', {
        phaseReady,
        moduleReady,
        currentPhase: getCurrentPhase()
      });
      
      return false;
    };
    
    // Check if all modules are ready for full rendering
    const checkFullAppStatus = () => {
      if (!mountedRef.current) return false;
      
      if (canRenderReactComponent() && isPhaseReady(requiredPhase)) {
        setAppReady(true);
        return true;
      }
      
      return false;
    };

    // Check immediately on mount
    if (checkReactStatus() && checkAppStatus()) {
      checkFullAppStatus();
      return;
    }
    
    // Set up poll with exponential backoff
    let attempt = 0;
    const maxAttempts = 10;
    
    checkInterval = window.setInterval(() => {
      if (!mountedRef.current) {
        window.clearInterval(checkInterval);
        return;
      }
      
      attempt++;
      console.log(`[AppMountGuard] Check attempt ${attempt}`);
      
      // First check if React is ready
      if (checkReactStatus()) {
        // Then check if we're at least in required phase
        if (checkAppStatus()) {
          // Finally check if the full app is ready
          if (checkFullAppStatus()) {
            window.clearInterval(checkInterval);
          }
        }
      }
      
      // If we've tried too many times, try alternate approaches
      if (attempt >= maxAttempts && !appReady && !recoveryAttempted) {
        console.warn('[AppMountGuard] Maximum initialization attempts reached, trying recovery');
        setRecoveryAttempted(true);
        
        // Final attempt: Use the waitForReactReady utility
        waitForReactReady(5000).then(ready => {
          if (mountedRef.current) {
            if (ready) {
              console.log('[AppMountGuard] React ready after waitForReactReady');
              setShowingFallback(false);
              setAppReady(true);
            } else {
              console.error('[AppMountGuard] React failed to initialize after recovery attempt');
              
              // Force reload as last resort
              if (typeof window !== 'undefined') {
                console.log('[AppMountGuard] Forcing page reload as last resort');
                recoveryId = window.setTimeout(() => window.location.reload(), 1000);
              }
            }
          }
        });
        
        // Clear the interval
        window.clearInterval(checkInterval);
      }
    }, Math.min(100 * Math.pow(2, Math.min(attempt, 5)), 3000)); // Exponential backoff up to max 3 seconds
    
    // Set a final timeout as backup
    timeoutId = window.setTimeout(() => {
      if (!mountedRef.current) return;
      
      if (!appReady) {
        console.error('[AppMountGuard] Initialization timed out after', timeout, 'ms');
        
        // Even if timed out, attempt to render if React seems available
        if (typeof window !== 'undefined' && window.React) {
          console.log('[AppMountGuard] Attempting render despite timeout');
          setShowingFallback(false);
          setAppReady(true);
        }
      }
    }, timeout);
    
    // Listen for React initialization events
    if (typeof window !== 'undefined') {
      const handleReactInitialized = () => {
        console.log('[AppMountGuard] Caught ReactInitialized event');
        checkReactStatus();
        checkAppStatus();
        checkFullAppStatus();
      };
      
      window.addEventListener('ReactInitialized', handleReactInitialized);
      
      // Cleanup function will reference this handler
      return () => {
        mountedRef.current = false;
        window.clearInterval(checkInterval);
        window.clearTimeout(timeoutId);
        
        if (typeof window !== 'undefined') {
          window.removeEventListener('ReactInitialized', handleReactInitialized);
          if (recoveryId) window.clearTimeout(recoveryId);
        }
      };
    }
  }, [appReady, requiredPhase, timeout, recoveryAttempted, showingFallback]);

  // Default fallback loading UI with Tavara branding
  const defaultFallback = (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-muted-foreground">Loading Tavara...</p>
      <p className="text-sm text-muted-foreground mt-2">Please wait while the application initializes</p>
    </div>
  );

  // Start with HTML-only fallback
  if (showingFallback) {
    return <div ref={fallbackRef}>{fallback || defaultFallback}</div>;
  }

  // Then show children when initialized
  return <>{children}</>;
}
