
import React, { lazy, Suspense, SVGProps, FC, ReactNode, useState, useEffect } from 'react';
import { createStaticIcon } from './iconFallbacks';

// Type for the icon props that all Lucide icons accept
export type LucideIconProps = SVGProps<SVGElement> & { 
  size?: number | string;
  absoluteStrokeWidth?: boolean;
  color?: string;
  strokeWidth?: number;
};

// Pure HTML/CSS fallback icon that doesn't depend on React features
const createFallbackElement = (iconProps: LucideIconProps) => {
  const { size = 24, className = '', color = 'currentColor' } = iconProps;
  
  // Early bailout with DOM element if React isn't ready
  if (typeof window === 'undefined' || !window.React || !window.reactInitialized) {
    const staticIconElement = createStaticIcon(
      typeof iconProps.name === 'string' ? iconProps.name : 'Loader2',
      { size, color, className }
    );
    
    // We need to wrap this in a placeholder since React expects JSX here
    console.warn('[lazyIcons] Using static DOM fallback, React not initialized');
    return <span className="icon-static-wrapper" ref={(node) => {
      if (node && !node.hasChildNodes()) {
        node.appendChild(staticIconElement);
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
    
    if (!hasReact) console.warn('[lazyIcons] Window.React is not available');
    if (!hasForwardRef) console.warn('[lazyIcons] React.forwardRef is not a function');
    if (!hasInitFlag) console.warn('[lazyIcons] reactInitialized flag is not true');
    
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
  
  useEffect(() => {
    if (ready) return;
    
    // Check if React is ready now
    if (isReactReady()) {
      setReady(true);
      return;
    }
    
    // Otherwise set up polling
    const checkInterval = setInterval(() => {
      if (isReactReady()) {
        setReady(true);
        clearInterval(checkInterval);
      }
    }, 100);
    
    // Also listen for the initialization event
    const handleReactInit = () => {
      console.log('[lazyIcons] Received ReactInitialized event');
      setReady(true);
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
        
        // Safe dynamic import of the icon
        const LazyIcon = lazy<FC<LucideIconProps>>(() => {
          return import('lucide-react')
            .then(module => {
              // Safety check - if the icon doesn't exist, return a fallback
              if (!(iconName in module)) {
                console.error(`[lazyIcons] Icon "${iconName}" not found in lucide-react`);
                return { default: (p: LucideIconProps) => createFallbackElement({...p, name: iconName}) as JSX.Element };
              }
              
              // Cast to the expected component type and return
              const IconComponent = module[iconName as keyof typeof module] as FC<LucideIconProps>;
              return { default: IconComponent };
            })
            .catch(error => {
              console.error(`[lazyIcons] Error loading icon "${iconName}":`, error);
              return { default: (p: LucideIconProps) => createFallbackElement({...p, name: iconName}) as JSX.Element };
            });
        });
        
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
