
/**
 * Application Bootstrap Coordinator
 * 
 * Orchestrates the initialization sequence for the application,
 * managing phases and ensuring dependencies are loaded in the correct order.
 */

import { registerModuleInit, isModuleReady } from './moduleInitTracker';

// Define initialization phases
export enum BootPhase {
  HTML_ONLY = 'html_only', // Pure HTML/CSS, no React
  BASIC_REACT = 'basic_react', // Basic React with minimal dependencies
  FULL_APP = 'full_app'  // Full application with all dependencies
}

// Track current bootstrap phase
let currentPhase: BootPhase = BootPhase.HTML_ONLY;
let bootstrapStartTime = Date.now();
let phaseChangeListeners: Array<(phase: BootPhase) => void> = [];

// Initialize bootstrap module
export function initBootstrap(): void {
  bootstrapStartTime = Date.now();
  console.log(`[AppBootstrap] Bootstrap initialized at ${new Date().toISOString()}`);
  
  // Register with window for debugging
  if (typeof window !== 'undefined') {
    window._bootstrapInit = {
      startTime: bootstrapStartTime,
      phases: {}
    };
  }
  
  // Start phase progression
  progressPhase();
}

// Register critical modules for boot sequence
export function registerReactReady(): void {
  registerModuleInit('react');
  progressPhase();
  
  // Notify any waiting components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ReactInitialized'));
    window.reactInitialized = true;
  }
}

export function registerReactDomReady(): void {
  registerModuleInit('reactDom');
  progressPhase();
}

export function registerIconsReady(): void {
  registerModuleInit('icons');
  console.log('[AppBootstrap] Icons module registered as ready');
  // Immediate progress check after icons are ready
  setTimeout(progressPhase, 0);
}

export function registerNavigationReady(): void {
  registerModuleInit('navigation');
  console.log('[AppBootstrap] Navigation module registered as ready');
  // Immediate progress check after navigation is ready
  setTimeout(progressPhase, 0);
}

export function registerAppReady(): void {
  registerModuleInit('app');
  progressPhase();
}

// Try to progress to the next phase if conditions are met
export function progressPhase(): void {
  const phaseTimes: Record<string, number> = {};
  const prevPhase = currentPhase;
  
  // Try to progress to BASIC_REACT
  if (currentPhase === BootPhase.HTML_ONLY && isModuleReady('react')) {
    currentPhase = BootPhase.BASIC_REACT;
    phaseTimes['basic_react'] = Date.now() - bootstrapStartTime;
    console.log(`[AppBootstrap] Progressed to BASIC_REACT phase after ${phaseTimes['basic_react']}ms`);
    
    // Store phase timing info
    if (typeof window !== 'undefined' && window._bootstrapInit) {
      window._bootstrapInit.phases['basic_react'] = {
        time: phaseTimes['basic_react'],
        timestamp: Date.now()
      };
    }
  }
  
  // Try to progress to FULL_APP
  // Modified condition: Either both 'navigation' and 'icons' OR just 'app' module needs to be ready
  if (currentPhase === BootPhase.BASIC_REACT && 
      isModuleReady('react') && 
      isModuleReady('reactDom') && 
      ((isModuleReady('navigation') && isModuleReady('icons')) || isModuleReady('app'))) {
    
    currentPhase = BootPhase.FULL_APP;
    phaseTimes['full_app'] = Date.now() - bootstrapStartTime;
    console.log(`[AppBootstrap] Progressed to FULL_APP phase after ${phaseTimes['full_app']}ms`);
    
    // Store phase timing info
    if (typeof window !== 'undefined' && window._bootstrapInit) {
      window._bootstrapInit.phases['full_app'] = {
        time: phaseTimes['full_app'],
        timestamp: Date.now()
      };
    }
    
    // Save stats to window for debugging
    if (typeof window !== 'undefined') {
      window.bootstrapTiming = phaseTimes;
    }
  }
  
  // Notify listeners if phase changed
  if (prevPhase !== currentPhase) {
    notifyPhaseChange(currentPhase);
  }
}

// Register a listener for phase changes
export function onPhaseChange(callback: (phase: BootPhase) => void): () => void {
  phaseChangeListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    phaseChangeListeners = phaseChangeListeners.filter(cb => cb !== callback);
  };
}

// Notify all listeners of phase change
function notifyPhaseChange(phase: BootPhase): void {
  phaseChangeListeners.forEach(callback => {
    try {
      callback(phase);
    } catch (error) {
      console.error('[AppBootstrap] Error in phase change listener:', error);
    }
  });
  
  // Also dispatch a DOM event for broader listening
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('BootPhaseChanged', { 
      detail: { phase, timestamp: Date.now() } 
    }));
  }
}

// Get current bootstrap phase
export function getCurrentPhase(): BootPhase {
  return currentPhase;
}

// Check if we're in a specific phase or later
export function isPhaseReady(phase: BootPhase): boolean {
  switch (phase) {
    case BootPhase.HTML_ONLY:
      return true;
    case BootPhase.BASIC_REACT:
      return currentPhase === BootPhase.BASIC_REACT || currentPhase === BootPhase.FULL_APP;
    case BootPhase.FULL_APP:
      return currentPhase === BootPhase.FULL_APP;
    default:
      return false;
  }
}

// Wait for a specific phase to be ready with timeout
export function waitForPhase(phase: BootPhase, timeout = 10000): Promise<boolean> {
  return new Promise(resolve => {
    // If already in this phase or later, resolve immediately
    if (isPhaseReady(phase)) {
      resolve(true);
      return;
    }
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      console.warn(`[AppBootstrap] Timeout waiting for phase ${phase}`);
      unsubscribe();
      resolve(false);
    }, timeout);
    
    // Set up listener
    const unsubscribe = onPhaseChange(currentPhase => {
      if (isPhaseReady(phase)) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(true);
      }
    });
  });
}

// Initialize bootstrap on load
if (typeof window !== 'undefined') {
  initBootstrap();
  
  // Register window event to mark completion
  window.addEventListener('load', () => {
    console.log(`[AppBootstrap] Window load event fired after ${Date.now() - bootstrapStartTime}ms`);
    
    // Final check to see if we can progress phases
    setTimeout(progressPhase, 100);
  });
}
