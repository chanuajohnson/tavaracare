
import React, { lazy, Suspense, ComponentType, SVGProps, ReactElement, FC, Ref, forwardRef } from 'react';

// Type for the icon props that all Lucide icons accept
export type LucideIconProps = SVGProps<SVGElement> & { 
  size?: number | string;
  absoluteStrokeWidth?: boolean;
  color?: string;
  strokeWidth?: number;
};

// A function to create a lazy-loaded Lucide icon component with deferred React.lazy() invocation
export function createLazyIcon(iconName: string): FC<LucideIconProps> {
  // Instead of creating the lazy component immediately, we create a component
  // that will create the lazy component only when it is rendered
  const IconComponent = forwardRef<SVGSVGElement, LucideIconProps>((props, ref) => {
    // Create the lazy component on demand, during render
    const LazyIcon = lazy(() => {
      // Ensure React is initialized before attempting to import
      if (typeof window !== 'undefined' && !window.React) {
        console.error('[lazyIcons] React not initialized when loading icon:', iconName);
        return Promise.resolve({
          default: () => (
            <span 
              style={{ width: props.size || 24, height: props.size || 24, display: 'inline-block' }} 
              className={props.className}
            />
          )
        });
      }
      
      // Now safely import the icon
      return import('lucide-react')
        .then(module => {
          // Safety check - if the icon doesn't exist, return a fallback empty component
          if (!(iconName in module)) {
            console.error(`Icon "${iconName}" not found in lucide-react`);
            return { 
              default: (iconProps: LucideIconProps) => {
                // Only pass safe HTML attributes to span element
                const { size, absoluteStrokeWidth, strokeWidth, color, ...safeProps } = iconProps;
                const spanProps = { 
                  style: { width: size || 24, height: size || 24, display: 'inline-block' },
                  className: iconProps.className
                };
                return <span {...spanProps} />;
              }
            };
          }
          
          // Get the icon component and ensure it's a valid component
          const IconComponent = module[iconName as keyof typeof module];
          
          // Return a properly wrapped component function to ensure correct typing
          return { 
            default: (iconProps: LucideIconProps) => {
              if (typeof IconComponent === 'function') {
                // For function components
                return React.createElement(IconComponent, { ...iconProps, ref });
              } else if (typeof IconComponent === 'object' && IconComponent !== null) {
                // For object components (like forwardRef components)
                return React.createElement(IconComponent, { ...iconProps, ref });
              }
              
              // Fallback if component is not valid
              return (
                <span 
                  style={{ width: iconProps.size || 24, height: iconProps.size || 24, display: 'inline-block' }} 
                  className={iconProps.className}
                >
                  <span style={{ color: 'red', fontSize: '8px' }}>!</span>
                </span>
              );
            }
          };
        })
        .catch(error => {
          console.error(`Error loading icon "${iconName}":`, error);
          return {
            default: (iconProps: LucideIconProps) => {
              const { size, className } = iconProps;
              return (
                <span 
                  style={{ width: size || 24, height: size || 24, display: 'inline-block' }} 
                  className={className}
                >
                  {/* Error indicator inside fallback */}
                  <span style={{ color: 'red', fontSize: '8px' }}>!</span>
                </span>
              );
            }
          };
        });
    });
    
    const { size, className, ...restProps } = props;
    const fallbackStyle = {
      width: size || 24,
      height: size || 24,
      display: 'inline-block'
    };
    
    // Only pass the necessary props to the Suspense fallback
    return (
      <Suspense fallback={<span className={className} style={fallbackStyle} />}>
        <LazyIcon size={size} className={className} {...restProps} ref={ref} />
      </Suspense>
    );
  });
  
  IconComponent.displayName = `LazyIcon(${iconName})`;
  return IconComponent;
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
