
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './components/framer/animations.css'; // Import animations CSS
import { ensureReact, waitForReactReady } from './utils/reactErrorHandler.ts';
import { AppMountGuard } from './components/app/AppMountGuard.tsx';
import { initModuleTracker, registerModuleInit } from './utils/moduleInitTracker.ts';
import { initBootstrap, registerReactReady, BootPhase } from './utils/appBootstrap.ts';
import { preloadStaticIcons } from './utils/iconFallbacks.ts';

// Preload static icons as early as possible
if (typeof window !== 'undefined') {
  console.log('[main.tsx] Preloading static icons early');
  preloadStaticIcons();
}

// Initialize our module tracking system
if (typeof window !== 'undefined') {
  // Define React globally as early as possible to prevent "React not defined" errors
  window.React = React;
  
  // Initialize module tracking
  initModuleTracker();
  initBootstrap();
  
  console.log('[main.tsx] React pre-initialization at:', new Date().toISOString());
  console.log('[main.tsx] React version:', React.version);
  
  // Track root render state to prevent duplicate renders during recovery
  window._rootRendered = false;
}

// Maximum number of retries before displaying an error
const MAX_MOUNT_RETRIES = 5;
let mountRetryCount = 0;

// Create a utility to safely mount the application
const mountApp = async () => {
  try {
    // Avoid duplicate render attempts
    if (typeof window !== 'undefined' && window._rootRendered) {
      console.log('[main.tsx] Skipping duplicate render attempt');
      return;
    }
    
    // First ensure React is available before doing anything
    const reactReady = ensureReact();
    
    console.log('[main.tsx] Initial React readiness check:', reactReady);
    
    // Wait for React to be fully initialized before continuing
    const readinessResult = await waitForReactReady(5000);
    
    console.log('[main.tsx] React readiness check complete:', readinessResult);
    
    // Find the container
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found in the DOM');
    }

    console.log('[main.tsx] Mounting application to DOM with safety guard');
    
    // Mark React as ready globally and dispatch event
    window.reactInitialized = true;
    
    // Register ReactDOM as ready
    registerReactReady();
    registerModuleInit('reactDom');
    
    // Ensure ReactInitialized event is dispatched
    window.dispatchEvent(new Event('ReactInitialized'));
    
    // Ensure we only render once
    if (typeof window !== 'undefined' && !window._rootRendered) {
      window._rootRendered = true;
      
      // Clear any previous content in root element to avoid DOM conflicts
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Create new root and render app
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <AppMountGuard requiredPhase={BootPhase.BASIC_REACT}>
            <App />
          </AppMountGuard>
        </React.StrictMode>
      );
      
      console.log('[main.tsx] Application successfully mounted at:', new Date().toISOString());
    } else {
      console.log('[main.tsx] Skipping duplicate render');
    }
  } catch (error) {
    console.error('[main.tsx] Failed to render application:', error);
    
    if (mountRetryCount < MAX_MOUNT_RETRIES) {
      mountRetryCount++;
      // Exponential backoff for retries (100ms, 200ms, 400ms, etc.)
      const delay = 100 * Math.pow(2, mountRetryCount - 1);
      console.log(`[main.tsx] Retrying mount in ${delay}ms (attempt ${mountRetryCount}/${MAX_MOUNT_RETRIES})`);
      setTimeout(mountApp, delay);
      return;
    }
    
    // Add fallback UI directly if React rendering fails after all retries
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; text-align: center;">
          <h3>Application failed to load</h3>
          <p>Please try refreshing the page. If the problem persists, clear your browser cache.</p>
          <div style="margin-top: 10px; padding: 10px; background: #f1f1f1; border-radius: 4px; text-align: left; font-family: monospace; font-size: 12px; overflow: auto; max-height: 150px;">
            ${error instanceof Error ? error.stack?.replace(/\n/g, '<br>') || error.message : String(error)}
          </div>
          <button onclick="window.location.reload()" style="background: #721c24; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
};

// Try to load the app only after document is fully ready
const attemptMount = () => {
  console.log('[main.tsx] Attempting to mount app, document state:', document.readyState);
  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // DOM is ready, attempt mount with slight delay to ensure all scripts are parsed
    console.log('[main.tsx] Document ready, scheduling mount');
    setTimeout(mountApp, 50);
  } else {
    // Wait for DOM to be ready
    console.log('[main.tsx] Document not ready, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[main.tsx] DOMContentLoaded event fired');
      // Small timeout to ensure everything is ready
      setTimeout(mountApp, 50);
    });
  }
};

// Start the mounting process
attemptMount();

// Also listen for window load as a backup
window.addEventListener('load', () => {
  console.log('[main.tsx] Window load event fired, checking mount status');
  
  // If app isn't mounted after 1 second, try again
  setTimeout(() => {
    if (mountRetryCount === 0 && typeof window !== 'undefined' && !window._rootRendered) {
      console.log('[main.tsx] No mount attempts detected after window load, trying now');
      attemptMount();
    }
  }, 1000);
});

// Add the root rendered flag to Window
declare global {
  interface Window {
    _rootRendered?: boolean;
  }
}
