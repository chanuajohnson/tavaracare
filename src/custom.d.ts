
// This file extends global interfaces to support our modifications

import React from 'react';

// Make React available globally on window object
declare global {
  interface Window {
    React: typeof React;
    reactInitialized?: boolean;
  }
}

// Export empty object to make this a proper module
export {};
