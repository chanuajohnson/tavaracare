
import React, { lazy, Suspense, ComponentType, SVGProps } from 'react';

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
    import('lucide-react').then(module => ({ 
      default: module[iconName as keyof typeof module] as ComponentType<LucideIconProps>
    }))
  );

  // Return a component that renders the lazy-loaded icon in a Suspense
  return (props: LucideIconProps) => (
    <Suspense fallback={null}>
      <LazyIcon {...props} />
    </Suspense>
  );
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
export const LazyInfo = createLazyIcon('Info');
