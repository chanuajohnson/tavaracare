
import React, { lazy, Suspense, SVGProps, FC, ReactNode, useState, useEffect, useRef } from 'react';
import { createStaticIcon, trackStaticIconUsage } from './iconFallbacks';

// Type for the icon props that all Lucide icons accept
export type LucideIconProps = SVGProps<SVGElement> & { 
  size?: number | string;
  absoluteStrokeWidth?: boolean;
  color?: string;
  strokeWidth?: number;
  name?: string; // Add name prop for fallback handling
};

// Type definition for the imported icon module
interface IconModule {
  default: FC<LucideIconProps>;
}

// Pure HTML/CSS fallback icon that doesn't depend on React features
const createFallbackElement = (iconProps: LucideIconProps) => {
  const { size = 24, className = '', color = 'currentColor', name } = iconProps;
  const iconName = name || (typeof iconProps.children === 'string' ? iconProps.children : 'Loader2');
  
  // Early bailout with DOM element if React isn't ready
  if (typeof window === 'undefined' || !window.React || !window.reactInitialized) {
    // Use ref callback pattern to ensure clean handling of DOM node
    return <span className="icon-static-wrapper" ref={(node) => {
      if (!node) return; // Node is being unmounted, no need to do anything
      
      try {
        // Clear previous children if any to avoid DOM node removal errors
        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }
        
        // Create and append the static icon
        const staticIconElement = createStaticIcon(
          iconName,
          { size, color, className }
        );
        
        node.appendChild(staticIconElement);
        
        // Track usage
        trackStaticIconUsage(iconName);
      } catch (error) {
        // If any error happens during DOM manipulation, log it but don't crash
        console.error(`[lazyIcons] Error creating static icon ${iconName}:`, error);
      }
    }} />;
  }
  
  // Create a simple div placeholder that mimics an icon's dimensions
  const style = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    display: 'inline-block',
    color: color,
    verticalAlign: 'middle',
    position: 'relative' as const
  };
  
  return <span className={`icon-fallback ${className}`} style={style} />;
};

// Check if React is ready for component creation with strong validation
const isReactReady = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Comprehensive React availability check
    const hasReact = !!window.React;
    const hasForwardRef = typeof window.React?.forwardRef === 'function';
    const hasInitFlag = window.reactInitialized === true;
    
    if (hasReact && hasForwardRef && hasInitFlag) {
      return true;
    }
    
    if (process.env.NODE_ENV !== 'production') {
      if (!hasReact) console.warn('[lazyIcons] Window.React is not available');
      if (!hasForwardRef) console.warn('[lazyIcons] React.forwardRef is not a function');
      if (!hasInitFlag) console.warn('[lazyIcons] reactInitialized flag is not true');
    }
    
    return false;
  } catch (error) {
    console.error('[lazyIcons] Error checking React readiness:', error);
    return false;
  }
};

/**
 * A hook to check React readiness that updates when React becomes available
 */
const useReactReady = () => {
  const [ready, setReady] = useState(isReactReady());
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    if (ready) return;
    
    // Check if React is ready now
    if (isReactReady()) {
      setReady(true);
      return;
    }
    
    // Otherwise set up polling
    const checkInterval = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(checkInterval);
        return;
      }
      
      if (isReactReady()) {
        setReady(true);
        clearInterval(checkInterval);
      }
    }, 100);
    
    // Also listen for the initialization event
    const handleReactInit = () => {
      console.log('[lazyIcons] Received ReactInitialized event');
      if (isMounted.current) {
        setReady(true);
      }
      clearInterval(checkInterval);
    };
    
    window.addEventListener('ReactInitialized', handleReactInit);
    
    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('ReactInitialized', handleReactInit);
    };
  }, [ready]);
  
  return ready;
};

// Safe import function that won't execute until React is ready
// Properly typed return value to match the expected type by lazy()
const safelyImportIcon = (iconName: string): Promise<IconModule> => {
  // Return a promise that won't resolve until React is ready
  return new Promise((resolve) => {
    // Helper function to log import attempts
    const logImportAttempt = (stage: string) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[lazyIcons] ${stage} import for ${iconName}`);
      }
    };

    // If React is ready, import immediately
    if (isReactReady()) {
      logImportAttempt('Starting');
      
      import('lucide-react')
        .then(module => {
          // Safety check - if the icon doesn't exist, return a fallback
          if (!(iconName in module)) {
            console.error(`[lazyIcons] Icon "${iconName}" not found in lucide-react`);
            // Return properly typed object with default property
            resolve({ 
              default: (p: LucideIconProps) => createFallbackElement({...p, name: iconName}) 
            } as IconModule);
          } else {
            logImportAttempt('Successful');
            // Cast to the expected component type and return
            const IconComponent = module[iconName as keyof typeof module] as FC<LucideIconProps>;
            resolve({ default: IconComponent });
          }
        })
        .catch(error => {
          console.error(`[lazyIcons] Error loading icon "${iconName}":`, error);
          // Return properly typed object with default property
          resolve({ 
            default: (p: LucideIconProps) => createFallbackElement({...p, name: iconName}) 
          } as IconModule);
        });
    } 
    // Otherwise, we need to wait for React
    else {
      logImportAttempt('Delaying');
      
      // First check if React is available with slight polling
      let attempts = 0;
      const maxAttempts = 50; // Limit retries to avoid infinite loop
      
      const checkAndImport = () => {
        attempts++;
        
        if (isReactReady()) {
          logImportAttempt(`Attempting after ${attempts} checks`);
          
          import('lucide-react')
            .then(module => {
              if (!(iconName in module)) {
                console.error(`[lazyIcons] Icon "${iconName}" not found in lucide-react`);
                // Return properly typed object
                resolve({ 
                  default: (p: LucideIconProps) => createFallbackElement({...p, name: iconName}) 
                } as IconModule);
              } else {
                logImportAttempt('Successful after delay');
                const IconComponent = module[iconName as keyof typeof module] as FC<LucideIconProps>;
                resolve({ default: IconComponent });
              }
            })
            .catch(error => {
              console.error(`[lazyIcons] Error loading icon "${iconName}" after waiting:`, error);
              // Return properly typed object
              resolve({ 
                default: (p: LucideIconProps) => createFallbackElement({...p, name: iconName}) 
              } as IconModule);
            });
        } else if (attempts < maxAttempts) {
          // Exponential backoff with a cap
          const delay = Math.min(100 * Math.pow(1.5, Math.min(attempts, 10)), 2000);
          setTimeout(checkAndImport, delay);
        } else {
          console.error(`[lazyIcons] Timed out waiting for React to load for icon ${iconName}`);
          // Return properly typed object
          resolve({ 
            default: (p: LucideIconProps) => createFallbackElement({...p, name: iconName}) 
          } as IconModule);
        }
      };
      
      // Also listen for the ReactInitialized event
      const handleReactInit = () => {
        logImportAttempt('React initialized');
        
        import('lucide-react')
          .then(module => {
            if (!(iconName in module)) {
              console.error(`[lazyIcons] Icon "${iconName}" not found in lucide-react`);
              // Return properly typed object
              resolve({ 
                default: (p: LucideIconProps) => createFallbackElement({...p, name: iconName}) 
              } as IconModule);
            } else {
              logImportAttempt('Successful after React init');
              const IconComponent = module[iconName as keyof typeof module] as FC<LucideIconProps>;
              resolve({ default: IconComponent });
            }
          })
          .catch(error => {
            console.error(`[lazyIcons] Error loading icon "${iconName}" after React init:`, error);
            // Return properly typed object
            resolve({ 
              default: (p: LucideIconProps) => createFallbackElement({...p, name: iconName}) 
            } as IconModule);
          });
          
        // Remove the event listener since we handled it
        window.removeEventListener('ReactInitialized', handleReactInit);
      };
      
      window.addEventListener('ReactInitialized', handleReactInit);
      
      // Start the polling process
      checkAndImport();
    }
  });
};

/**
 * Creates a lazy-loaded icon component with advanced error handling
 * and graceful fallbacks when React is not fully initialized
 */
export function createLazyIcon(iconName: string): FC<LucideIconProps> {
  // Early static DOM check
  if (typeof window !== 'undefined' && (!window.React || !window.reactInitialized)) {
    console.log(`[lazyIcons] Using early static fallback for ${iconName}`);
  }
  
  const LazyIconComponent: FC<LucideIconProps> = (props) => {
    // Track component mount state for safe updates
    const isMounted = useRef(true);
    
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);
    
    // Use the hook for React readiness (only works if React is minimally available)
    let reactIsReady = false;
    
    try {
      // Try to use the hook pattern if minimal React is available
      if (typeof React.useState === 'function') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        reactIsReady = useReactReady();
      } else {
        // Fallback to direct check if hooks aren't working
        reactIsReady = isReactReady();
      }
    } catch (error) {
      console.warn(`[lazyIcons] Error checking React readiness for ${iconName}:`, error);
      reactIsReady = false;
    }
    
    // Early bailout with fallback if React isn't ready
    if (!reactIsReady) {
      return createFallbackElement({...props, name: iconName});
    }
    
    try {
      // Only load the actual icon when React is fully initialized
      const IconContent = () => {
        // Double-check React is still available
        if (!isReactReady()) {
          return createFallbackElement({...props, name: iconName});
        }
        
        // Safe dynamic import of the icon using our safe import function with proper typing
        const LazyIcon = lazy<FC<LucideIconProps>>(() => safelyImportIcon(iconName));
        
        // Create a fallback that doesn't depend on React.forwardRef
        const fallbackElement = createFallbackElement({...props, name: iconName});
        
        // Extract ref to avoid passing it to components that don't expect it
        const { ref, ...restProps } = props;
        
        return (
          <Suspense fallback={fallbackElement}>
            <LazyIcon {...restProps} />
          </Suspense>
        );
      };
      
      return <IconContent />;
    } catch (error) {
      console.error(`[lazyIcons] Error rendering icon "${iconName}":`, error);
      return createFallbackElement({...props, name: iconName});
    }
  };
  
  // Add display name for better debugging
  LazyIconComponent.displayName = `LazyIcon(${iconName})`;
  return LazyIconComponent;
}

// Pre-create commonly used icons
export const LazyLogOut = createLazyIcon('LogOut');
export const LazyLogIn = createLazyIcon('LogIn');
export const LazyLayoutDashboard = createLazyIcon('LayoutDashboard');
export const LazyChevronDown = createLazyIcon('ChevronDown');
export const LazyLoader2 = createLazyIcon('Loader2');
export const LazyBarChart = createLazyIcon('BarChart');
export const LazyUsers = createLazyIcon('Users');
export const LazyUserPlus = createLazyIcon('UserPlus');
export const LazyHome = createLazyIcon('Home');
export const LazyHeartPulse = createLazyIcon('HeartPulse');
export const LazyBookOpen = createLazyIcon('BookOpen');
export const LazyMessageSquare = createLazyIcon('MessageSquare');
export const LazyCalendar = createLazyIcon('Calendar');
export const LazyUserCircle = createLazyIcon('UserCircle');
export const LazyLifeBuoy = createLazyIcon('LifeBuoy');
export const LazyBuilding2 = createLazyIcon('Building2');
export const LazyFileText = createLazyIcon('FileText');
export const LazyCreditCard = createLazyIcon('CreditCard');
export const LazyInfo = createLazyIcon('Info');
export const LazyMenu = createLazyIcon('Menu');
export const LazyCheckCircle2 = createLazyIcon('CheckCircle2');
export const LazyCircle = createLazyIcon('Circle');
export const LazyList = createLazyIcon('List');
export const LazyArrowRight = createLazyIcon('ArrowRight');
export const LazyClock = createLazyIcon('Clock');
export const LazyLock = createLazyIcon('Lock');
export const LazyHelpCircle = createLazyIcon('HelpCircle');
// Additional icons
export const LazyUsers2 = createLazyIcon('Users2');
export const LazyHeart = createLazyIcon('Heart');
export const LazyArrowUp = createLazyIcon('ArrowUp');
export const LazyArrowDown = createLazyIcon('ArrowDown');
export const LazyLightbulb = createLazyIcon('Lightbulb');
export const LazyGlobe = createLazyIcon('Globe');
export const LazyAward = createLazyIcon('Award');
export const LazyVote = createLazyIcon('Vote');
export const LazyCheck = createLazyIcon('Check');
