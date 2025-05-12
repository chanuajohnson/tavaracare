
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ensureReact } from './utils/reactErrorHandler.ts';

// Ensure React is available globally
if (typeof window !== 'undefined') {
  window.React = React;
  console.log('React initialized globally:', !!window.React);
}

try {
  ensureReact(); // Check for proper React initialization
  
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element not found in the DOM');

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('Application successfully mounted');
} catch (error) {
  console.error('Failed to render application:', error);
  // Add fallback UI directly if React rendering fails
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '<div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">Application failed to load. Please refresh the page.</div>';
  }
}
