
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

// Initialize bootstrap module
export function initBootstrap(): void {
  bootstrapStartTime = Date.now();
  console.log(`[AppBootstrap] Bootstrap initialized at ${new Date().toISOString()}`);
  
  // Start phase progression
  progressPhase();
}

// Register critical modules for boot sequence
export function registerReactReady(): void {
  registerModuleInit('react');
  progressPhase();
}

export function registerReactDomReady(): void {
  registerModuleInit('reactDom');
  progressPhase();
}

export function registerIconsReady(): void {
  registerModuleInit('icons');
  progressPhase();
}

export function registerNavigationReady(): void {
  registerModuleInit('navigation');
  progressPhase();
}

export function registerAppReady(): void {
  registerModuleInit('app');
  progressPhase();
}

// Try to progress to the next phase if conditions are met
function progressPhase(): void {
  const isProduction = import.meta.env.PROD;
  const phaseTimes: Record<string, number> = {};
  
  // Try to progress to BASIC_REACT
  if (currentPhase === BootPhase.HTML_ONLY && isModuleReady('react')) {
    currentPhase = BootPhase.BASIC_REACT;
    phaseTimes['basic_react'] = Date.now() - bootstrapStartTime;
    console.log(`[AppBootstrap] Progressed to BASIC_REACT phase after ${phaseTimes['basic_react']}ms`);
  }
  
  // Try to progress to FULL_APP
  if (currentPhase === BootPhase.BASIC_REACT && 
      isModuleReady('react') && 
      isModuleReady('reactDom') && 
      isModuleReady('navigation')) {
    currentPhase = BootPhase.FULL_APP;
    phaseTimes['full_app'] = Date.now() - bootstrapStartTime;
    console.log(`[AppBootstrap] Progressed to FULL_APP phase after ${phaseTimes['full_app']}ms`);
    
    // Save stats to window for debugging
    if (typeof window !== 'undefined') {
      window.bootstrapTiming = phaseTimes;
    }
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

// Initialize bootstrap on load
if (typeof window !== 'undefined') {
  initBootstrap();
  
  // Register window event to mark completion
  window.addEventListener('load', () => {
    console.log(`[AppBootstrap] Window load event fired after ${Date.now() - bootstrapStartTime}ms`);
  });
}
