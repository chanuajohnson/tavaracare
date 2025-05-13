
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ensureReact } from './utils/reactErrorHandler.ts';

// Ensure React is available globally before any other imports
if (typeof window !== 'undefined') {
  // Set React globally to ensure it's available early
  window.React = React;
  
  // Flag that React is initialized
  window.reactInitialized = true;
  
  // Add diagnostic logs for initialization
  console.log('[main.tsx] React initialization starting at:', new Date().toISOString());
  console.log('[main.tsx] React version:', React.version);
}

// Create a utility to safely mount the application
const mountApp = () => {
  try {
    ensureReact(); // Check for proper React initialization
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found in the DOM');
    }

    // Clear any loading UI
    container.innerHTML = '';
    
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

// Use a small delay to ensure DOM is fully ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  // Small timeout to ensure everything is ready
  setTimeout(mountApp, 10);
}
