
/**
 * Module Initialization Tracker
 * 
 * A centralized system to track the initialization status of critical modules
 * and ensure dependencies are properly loaded before they're used.
 */

// Define the modules we want to track
type ModuleType = 'react' | 'reactDom' | 'icons' | 'navigation' | 'app';

// Track initialization state for each module
interface ModuleState {
  initialized: boolean;
  startTime: number;
  endTime?: number;
  dependencies: ModuleType[];
  error?: Error;
}

// Global state for module tracking
const moduleStates: Record<ModuleType, ModuleState> = {
  react: {
    initialized: false,
    startTime: Date.now(),
    dependencies: [],
  },
  reactDom: {
    initialized: false,
    startTime: Date.now(),
    dependencies: ['react'],
  },
  icons: {
    initialized: false,
    startTime: Date.now(),
    dependencies: ['react'],
  },
  navigation: {
    initialized: false,
    startTime: Date.now(),
    dependencies: ['react', 'icons'],
  },
  app: {
    initialized: false,
    startTime: Date.now(),
    dependencies: ['react', 'reactDom', 'navigation'],
  }
};

/**
 * Register a module as initialized
 */
export function registerModuleInit(module: ModuleType): void {
  if (moduleStates[module]) {
    moduleStates[module].initialized = true;
    moduleStates[module].endTime = Date.now();
    console.log(`[ModuleTracker] ${module} initialized after ${moduleStates[module].endTime - moduleStates[module].startTime}ms`);
  }
}

/**
 * Register an error during module initialization
 */
export function registerModuleError(module: ModuleType, error: Error): void {
  if (moduleStates[module]) {
    moduleStates[module].error = error;
    console.error(`[ModuleTracker] Error initializing ${module}:`, error);
  }
}

/**
 * Check if a module and all its dependencies are initialized
 */
export function isModuleReady(module: ModuleType): boolean {
  const moduleState = moduleStates[module];
  
  if (!moduleState) return false;
  if (!moduleState.initialized) return false;
  
  // Check if all dependencies are initialized
  for (const dependency of moduleState.dependencies) {
    if (!isModuleReady(dependency)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get the initialization status of all modules
 */
export function getModuleStatus(): Record<ModuleType, boolean> {
  const status: Record<ModuleType, boolean> = {} as Record<ModuleType, boolean>;
  
  for (const module of Object.keys(moduleStates) as ModuleType[]) {
    status[module] = isModuleReady(module);
  }
  
  return status;
}

/**
 * Initialize the tracker with timestamps
 */
export function initModuleTracker(): void {
  // Update start times
  for (const module of Object.keys(moduleStates) as ModuleType[]) {
    moduleStates[module].startTime = Date.now();
  }
  
  // Log initial state
  console.log('[ModuleTracker] Module tracking initialized');
  
  // Start the react module tracking
  if (typeof window !== 'undefined' && window.React) {
    if (typeof window.React.forwardRef === 'function') {
      registerModuleInit('react');
    }
  }
}

// Initialize module tracker on load
if (typeof window !== 'undefined') {
  initModuleTracker();
}
