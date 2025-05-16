
/**
 * Production Debugging Utils
 * 
 * Tools to help diagnose problems in production environments
 */

import { getModuleStatus } from './moduleInitTracker';
import { logReactStatus } from './reactErrorHandler';
import { getCurrentPhase, BootPhase } from './appBootstrap';

// Check if debugging is enabled via URL parameter
export function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('debug') || localStorage.getItem('tavara_debug_enabled') === 'true';
}

// Toggle debug mode
export function toggleDebugMode(enable: boolean): void {
  if (typeof window === 'undefined') return;
  
  if (enable) {
    localStorage.setItem('tavara_debug_enabled', 'true');
    console.log('Debug mode enabled');
  } else {
    localStorage.removeItem('tavara_debug_enabled');
    console.log('Debug mode disabled');
  }
}

// Collect and return diagnostic info about the current system state
export function collectDiagnostics(): Record<string, any> {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    moduleStatus: getModuleStatus(),
    reactStatus: logReactStatus(),
    bootPhase: getCurrentPhase(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
    domReady: typeof document !== 'undefined' ? document.readyState : 'SSR',
    bootstrapTiming: typeof window !== 'undefined' ? window.bootstrapTiming || {} : {},
  };

  return diagnostics;
}

// Log diagnostics to console
export function logDiagnostics(): void {
  if (!isDebugMode()) return;
  
  const diagnostics = collectDiagnostics();
  console.log('=== TAVARA DIAGNOSTICS ===');
  console.table(diagnostics);
  console.log('=========================');
  
  return diagnostics;
}

// Send diagnostics to server (if needed)
export function reportDiagnostics(): void {
  if (!isDebugMode()) return;
  
  const diagnostics = collectDiagnostics();
  
  // In a real implementation, you might send this to a server
  console.log('Reporting diagnostics:', diagnostics);
  
  // Example of sending to server:
  // fetch('/api/diagnostics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(diagnostics)
  // });
}

// Initialize debugging if URL parameter is present
if (typeof window !== 'undefined') {
  if (isDebugMode()) {
    console.log('Debug mode active - detailed logging enabled');
    window.addEventListener('load', () => {
      setTimeout(logDiagnostics, 1000);
    });
  }
}

// Add global debug commands
if (typeof window !== 'undefined') {
  window.tavaraDebug = {
    toggleDebug: toggleDebugMode,
    logDiagnostics,
    reportDiagnostics,
    getStatus: getModuleStatus
  };
}

// Export types for global window augmentation
declare global {
  interface Window {
    tavaraDebug?: {
      toggleDebug: typeof toggleDebugMode;
      logDiagnostics: typeof logDiagnostics;
      reportDiagnostics: typeof reportDiagnostics;
      getStatus: typeof getModuleStatus;
    };
  }
}
