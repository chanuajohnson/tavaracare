
import React from 'react';

declare global {
  interface Window {
    React?: typeof React;
    reactInitialized?: boolean;
    [key: string]: any;
  }
}

export {};
