
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure React is available globally (for legacy scripts that might need it)
if (typeof window !== 'undefined' && !window.React) {
  window.React = React;
}

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found in the DOM');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
