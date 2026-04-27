import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (window.React === undefined) {
  window.React = React;
}
window.reactInitialized = true;

createRoot(document.getElementById("root")!).render(<App />);
