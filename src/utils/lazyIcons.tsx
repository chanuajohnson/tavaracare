
import React, { lazy, Suspense, SVGProps, FC, ReactNode } from 'react';

// Type for the icon props that all Lucide icons accept
export type LucideIconProps = SVGProps<SVGElement> & { 
  size?: number | string;
  absoluteStrokeWidth?: boolean;
  color?: string;
  strokeWidth?: number;
};

// Define a fallback element creator function early to avoid "used before declaration" error
const createFallbackElement = (iconProps: LucideIconProps) => {
  const { size, className } = iconProps;
  const fallbackStyle = {
    width: size || 24,
    height: size || 24,
    display: 'inline-block'
  };
  
  return <span className={className} style={fallbackStyle} />;
};

// A function to create a lazy-loaded Lucide icon component with proper React initialization checks
export function createLazyIcon(iconName: string): FC<LucideIconProps> {
  // Create a component that will properly handle React initialization and errors
  const LazyIconComponent: FC<LucideIconProps> = (props) => {
    // Check if React is initialized before attempting to use forwardRef
    if (typeof window === 'undefined' || !window.React || !window.React.forwardRef) {
      console.warn(`[lazyIcons] React not fully initialized when rendering ${iconName}`);
      // Return a simple fallback element that doesn't depend on React.forwardRef
      return createFallbackElement(props);
    }
    
    try {
      // Only load the icon when we're sure React is fully initialized
      const IconWrapper = () => {
        // Explicitly type the lazy-loaded component to ensure TypeScript compatibility
        const LazyIcon = lazy<FC<LucideIconProps>>(() => {
          console.log(`[lazyIcons] Loading icon ${iconName}`);
          
          return import('lucide-react')
            .then(module => {
              // Safety check - if the icon doesn't exist, return a fallback
              if (!module || !(iconName in module)) {
                console.error(`Icon "${iconName}" not found in lucide-react`);
                // Create a typed fallback component
                const FallbackComponent: FC<LucideIconProps> = (iconProps) => createFallbackElement(iconProps);
                return { 
                  default: FallbackComponent
                };
              }
              
              // Return the icon component properly wrapped with correct typing
              const LoadedIcon = module[iconName as keyof typeof module] as unknown as FC<LucideIconProps>;
              return { 
                default: LoadedIcon
              };
            })
            .catch(error => {
              console.error(`Error loading icon "${iconName}":`, error);
              // Create a typed error fallback component
              const ErrorFallback: FC<LucideIconProps> = (iconProps) => createFallbackElement(iconProps);
              return {
                default: ErrorFallback
              };
            });
        });
        
        const fallbackElement = createFallbackElement(props);
        
        // Extract ref to avoid passing it to components that don't expect it
        // This fixes the ref type incompatibility error
        const { ref, ...restProps } = props;
        
        return (
          <Suspense fallback={fallbackElement}>
            <LazyIcon {...restProps} />
          </Suspense>
        );
      };
      
      return <IconWrapper />;
    } catch (error) {
      console.error(`Error rendering icon "${iconName}":`, error);
      return createFallbackElement(props);
    }
  };
  
  LazyIconComponent.displayName = `LazyIcon(${iconName})`;
  return LazyIconComponent;
}

// Pre-create commonly used icons to avoid repeated definitions
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
// Additional icons used in your application
export const LazyUsers2 = createLazyIcon('Users2');
export const LazyHeart = createLazyIcon('Heart');
export const LazyArrowUp = createLazyIcon('ArrowUp');
export const LazyArrowDown = createLazyIcon('ArrowDown');
export const LazyLightbulb = createLazyIcon('Lightbulb');
export const LazyGlobe = createLazyIcon('Globe');
export const LazyAward = createLazyIcon('Award');
export const LazyVote = createLazyIcon('Vote');
export const LazyCheck = createLazyIcon('Check');
