import React from 'react';

declare global {
  interface Window {
    React: any;
    reactInitialized: boolean;
    tavaraInitTiming?: {
      start: number;
      events: Array<{ event: string, timestamp: number, elapsed: string }>;
    };
    bootstrapTiming?: Record<string, number>;
    tavaraDebug?: {
      toggleDebug: (enabled: boolean) => void;
      logDiagnostics: () => void;
      reportDiagnostics: () => void;
      getStatus: () => Record<string, boolean>;
    };
    logInitEvent?: (eventName: string) => void;
    [key: string]: any;
  }
}

export {};
