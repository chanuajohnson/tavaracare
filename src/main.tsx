
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './components/framer/animations.css'; // Import animations CSS
import { ensureReact } from './utils/reactErrorHandler.ts';
import { AppMountGuard } from './components/app/AppMountGuard.tsx';
import { initModuleTracker, registerModuleInit } from './utils/moduleInitTracker.ts';
import { initBootstrap, registerReactDomReady } from './utils/appBootstrap.ts';

// Initialize our module tracking system
if (typeof window !== 'undefined') {
  // Define React globally as early as possible
  window.React = React;
  
  // Initialize module tracking
  initModuleTracker();
  initBootstrap();
  
  console.log('[main.tsx] React pre-initialization at:', new Date().toISOString());
  console.log('[main.tsx] React version:', React.version);
}

// Maximum number of retries before displaying an error
const MAX_MOUNT_RETRIES = 5;
let mountRetryCount = 0;

// Create a utility to safely mount the application
const mountApp = () => {
  try {
    // Ensure React is ready before mounting
    const reactReady = ensureReact();
    
    console.log('[main.tsx] Initial React readiness check:', reactReady);
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found in the DOM');
    }

    console.log('[main.tsx] Mounting application to DOM with safety guard');
    
    // Register ReactDOM as ready
    registerReactDomReady();
    registerModuleInit('reactDom');
    
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <AppMountGuard>
          <App />
        </AppMountGuard>
      </React.StrictMode>
    );
    
    console.log('[main.tsx] Application successfully mounted at:', new Date().toISOString());
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
      rootElement.innerHTML = '<div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; text-align: center;"><h3>Application failed to load</h3><p>Please try refreshing the page. If the problem persists, clear your browser cache.</p><button onclick="window.location.reload()" style="background: #721c24; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;">Refresh Page</button></div>';
    }
  }
};

// Ensure DOM is fully loaded before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[main.tsx] DOMContentLoaded event fired');
    // Small timeout to ensure everything is ready
    setTimeout(mountApp, 50);
  });
} else {
  // DOM already loaded, but add a small delay to ensure all scripts are parsed
  console.log('[main.tsx] DOM already loaded, scheduling mount');
  setTimeout(mountApp, 50);
}

// Export types for global window augmentation
declare global {
  interface Window {
    React: typeof React;
    reactInitialized: boolean;
    bootstrapTiming?: Record<string, number>;
  }
}
