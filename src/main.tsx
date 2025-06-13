
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Set a flag to indicate React is initialized
// This helps prevent errors with forwardRef being used before React is ready
if (window.React === undefined) {
  window.React = React;
}
window.reactInitialized = true;

createRoot(document.getElementById("root")!).render(<App />);
