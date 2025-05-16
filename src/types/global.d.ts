

// Global type definitions

// Make sure we have the right window object type augmentation
interface Window {
  // React initialization status
  React: any;
  reactInitialized: boolean;
  
  // Bootstrap timing information
  bootstrapTiming?: Record<string, number>;
  tavaraInitTiming?: {
    start: number;
    events: Array<{event: string, timestamp: number, elapsed: string}>
  };
  _bootstrapInit?: {
    startTime: number;
    phases: Record<string, {time: number, timestamp: number}>
  };
  
  // Recovery mechanisms
  _reactRecoveryTimeout?: number;
  _staticIconsPreloaded?: boolean;
  _initLogs?: Array<{
    timestamp: string;
    errorType?: string;
    phase?: string;
    recovery?: string;
    error?: string;
    source?: string;
    line?: number;
    col?: number;
    errorMessage?: string;
    errorStack?: string;
  }>;
  
  // Debug utilities
  tavaraDebug?: {
    toggleDebug: (enable: boolean) => void;
    logDiagnostics: () => void;
    reportDiagnostics: () => void;
    getStatus: () => Record<string, boolean>;
  };
  
  // Helper function used in the HTML
  logInitEvent?: (eventName: string) => void;
}

// Extend the HTML attributes to add our custom data attributes
declare namespace JSX {
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement> & {
        'data-init-phase'?: string;
      },
      HTMLDivElement
    >;
  }
}

// Declare module augmentations for dynamic imports
declare module 'lucide-react/dynamicIconImports' {
  const dynamicIconImports: Record<string, () => Promise<any>>;
  export default dynamicIconImports;
}

// Declare global utility types for our React components
declare type LucideIcon = React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;

// Add support for the ReactInitialized event in DOM events
interface WindowEventMap {
  ReactInitialized: Event;
}

