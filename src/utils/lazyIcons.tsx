
import React, { lazy, Suspense, ComponentType, SVGProps, ReactElement } from 'react';

// Type for the icon props that all Lucide icons accept
export type LucideIconProps = SVGProps<SVGSVGElement> & { 
  size?: number | string;
  absoluteStrokeWidth?: boolean;
  color?: string;
  strokeWidth?: number;
};

// A function to create a lazy-loaded Lucide icon component
export function createLazyIcon(iconName: string): ComponentType<LucideIconProps> {
  // Use React.lazy to dynamically import the icon
  const LazyIcon = lazy(() => 
    import('lucide-react').then(module => {
      // Safety check - if the icon doesn't exist, return a fallback empty component
      if (!(iconName in module)) {
        console.error(`Icon "${iconName}" not found in lucide-react`);
        return { default: (props: LucideIconProps) => <span {...props}></span> };
      }
      // Return the icon component
      return { default: module[iconName as keyof typeof module] as ComponentType<LucideIconProps> };
    })
  );

  // Return a component that renders the lazy-loaded icon in a Suspense
  return function LazyIconWrapper(props: LucideIconProps): ReactElement {
    // Extract props that are safe to pass to the span fallback
    const { size, className, style } = props;
    const fallbackStyle = {
      width: size || 24,
      height: size || 24,
      display: 'inline-block', 
      ...(style || {})
    };
    
    return (
      <Suspense fallback={<span className={className} style={fallbackStyle} />}>
        <LazyIcon {...props} />
      </Suspense>
    );
  };
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
