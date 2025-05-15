
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './components/framer/animations.css'; // Import animations CSS
import { ensureReact } from './utils/reactErrorHandler.ts';

// Define React globally as early as possible
if (typeof window !== 'undefined') {
  // Ensure React is globally available before any other code runs
  window.React = React;
  
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
    if (!reactReady) {
      console.log('[main.tsx] React not ready, retry attempt:', mountRetryCount + 1);
      
      if (mountRetryCount < MAX_MOUNT_RETRIES) {
        mountRetryCount++;
        // Exponential backoff for retries (100ms, 200ms, 400ms, etc.)
        const delay = 100 * Math.pow(2, mountRetryCount - 1);
        setTimeout(mountApp, delay);
        return;
      } else {
        console.error('[main.tsx] Maximum mount retries reached, displaying error UI');
        
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.innerHTML = '<div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; text-align: center;"><h3>Application failed to initialize</h3><p>We\'re having trouble loading the application. Please try refreshing the page.</p><button onclick="window.location.reload()" style="background: #721c24; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;">Refresh Page</button></div>';
        }
        return;
      }
    }
    
    if (typeof window !== 'undefined' && !window.reactInitialized) {
      // Set reactInitialized flag to true to indicate React is now ready
      window.reactInitialized = true;
      console.log('[main.tsx] Setting React initialization flag at:', new Date().toISOString());
    }
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found in the DOM');
    }

    // Check loading UI and clear it
    console.log('[main.tsx] Current root content:', container.innerHTML);
    
    // Don't clear loading UI until we're ready to render
    
    console.log('[main.tsx] Mounting application to DOM');
    
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('[main.tsx] Application successfully mounted at:', new Date().toISOString());
  } catch (error) {
    console.error('[main.tsx] Failed to render application:', error);
    // Add fallback UI directly if React rendering fails
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
