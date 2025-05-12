
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ensureReact } from './utils/reactErrorHandler.ts';

// Ensure React is available globally before any other imports
if (typeof window !== 'undefined') {
  window.React = React;
  window.reactInitialized = true;
  // Add timing diagnostic log
  console.log('[main.tsx] React initialization happening at:', new Date().toISOString());
  console.log('[main.tsx] React version:', React.version);
  console.log('[main.tsx] React initialized globally:', !!window.React);
}

// Wrap the app rendering in a try-catch for better error handling
try {
  ensureReact(); // Check for proper React initialization
  
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element not found in the DOM');

  console.log('[main.tsx] Mounting application to DOM');
  
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('[main.tsx] Application successfully mounted');
} catch (error) {
  console.error('[main.tsx] Failed to render application:', error);
  // Add fallback UI directly if React rendering fails
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '<div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">Application failed to load. Please refresh the page.</div>';
  }
}
