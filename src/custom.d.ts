
// This file extends global interfaces to support our modifications

import React from 'react';

declare global {
  interface Window {
    React?: typeof React;
  }
}
