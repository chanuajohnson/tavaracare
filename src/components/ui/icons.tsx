import React, { lazy, Suspense, useState, useEffect } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { createStaticIcon } from '@/utils/iconFallbacks';

// Flag to track if React is ready for icon rendering
const isReactReady = () => {
  if (typeof window === 'undefined') return false;
  return !!window.reactInitialized;
};

// Static placeholder while React is initializing or icon is loading
const IconFallback = ({ name, ...props }: { name: string } & LucideProps) => {
  // For size, we need to ensure it's properly typed when passed to createStaticIcon
  // Convert size to a number before passing to createStaticIcon
  let iconSize: number = 24; // Default size
  
  if (props.size !== undefined) {
    if (typeof props.size === 'number') {
      iconSize = props.size;
    } else if (typeof props.size === 'string') {
      // Parse string to a number or use default if parsing fails
      const parsed = parseInt(props.size, 10);
      iconSize = isNaN(parsed) ? 24 : parsed;
    }
  }
  
  // We now have iconSize as a proper number type
  const staticIcon = createStaticIcon(name, {
    size: iconSize, // Pass iconSize as a number
    color: props.color || 'currentColor',
    strokeWidth: props.strokeWidth || 2,
    className: props.className || ''
  });
  
  // We need to wrap the static DOM element in a container for React
  return (
    <span 
      ref={(el) => {
        if (el) {
          // Clear any existing content
          while (el.firstChild) {
            el.removeChild(el.firstChild);
          }
          // Append our static icon
          el.appendChild(staticIcon);
        }
      }}
      style={{ display: 'inline-flex' }}
    />
  );
};

// Create a lazy-loaded icon component that uses staticIcon as fallback
export function createLazyIcon(name: keyof typeof dynamicIconImports) {
  // Convert name format (kebab-case to PascalCase)
  const iconName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  // Create the lazy component
  const LazyIcon = lazy(() => {
    // Only attempt to load the real icon if React is ready
    if (!isReactReady()) {
      return new Promise<{ default: React.ComponentType<LucideProps> }>((resolve) => {
        const checkReady = () => {
          if (isReactReady()) {
            window.removeEventListener('ReactInitialized', checkReady);
            import(`lucide-react/dist/esm/icons/${name}`)
              .then(module => resolve(module))
              .catch(err => {
                console.error(`[icons] Failed to load icon: ${name}`, err);
                // Return a minimal component as fallback
                resolve({ 
                  default: (props: LucideProps) => <IconFallback name={iconName} {...props} /> 
                });
              });
          }
        };
        
        // Listen for React initialization
        window.addEventListener('ReactInitialized', checkReady);
        // Also check immediately in case it's already ready
        checkReady();
      });
    }
    
    // Fix for Error #2: Fix the return type by using explicit type definition
    // React is ready, load the icon normally
    return import(`lucide-react/dist/esm/icons/${name}`)
      .catch(err => {
        console.error(`[icons] Failed to load icon: ${name}`, err);
        // Return a minimal component as fallback with proper type
        return { 
          default: (props: LucideProps) => <IconFallback name={iconName} {...props} /> 
        } as { default: React.ComponentType<LucideProps> };
      });
  });

  // Return a component that uses Suspense + fallback
  return React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => {
    const [shouldRender, setShouldRender] = useState(isReactReady());

    useEffect(() => {
      if (!shouldRender) {
        const handleReactReady = () => setShouldRender(true);
        window.addEventListener('ReactInitialized', handleReactReady);
        // Also set it if React is already initialized
        if (isReactReady()) {
          setShouldRender(true);
        }
        
        return () => {
          window.removeEventListener('ReactInitialized', handleReactReady);
        };
      }
    }, [shouldRender]);

    // When React isn't ready yet, use static icon
    if (!shouldRender) {
      return <IconFallback name={iconName} {...props} />;
    }

    // When React is ready, use Suspense + lazy loading
    return (
      <Suspense fallback={<IconFallback name={iconName} {...props} />}>
        <LazyIcon ref={ref} {...props} />
      </Suspense>
    );
  });
}

// Create a dynamic icon component that can render any icon by name
export const Icon = React.forwardRef<SVGSVGElement, LucideProps & { name: string }>(
  ({ name, ...props }, ref) => {
    // If the component is rendered before React is ready, use a static icon
    const [shouldRender, setShouldRender] = useState(isReactReady());

    useEffect(() => {
      if (!shouldRender) {
        const handleReactReady = () => setShouldRender(true);
        window.addEventListener('ReactInitialized', handleReactReady);
        // Also set it if React is already initialized
        if (isReactReady()) {
          setShouldRender(true);
        }
        
        return () => {
          window.removeEventListener('ReactInitialized', handleReactReady);
        };
      }
    }, [shouldRender]);

    // Convert name to kebab-case for dynamic imports
    const iconKey = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    
    // Use static icon until React is ready
    if (!shouldRender) {
      return <IconFallback name={name} {...props} />;
    }

    // Once React is ready, use lazy-loaded component
    const DynamicIcon = lazy(() => {
      // Try to load the icon by its kebab-case name
      // Use type assertion here to fix the TypeScript error
      const safeIconKey = iconKey as keyof typeof dynamicIconImports;
      
      // Fix: Define a proper interface for the icon module
      interface IconModule {
        default: React.ComponentType<LucideProps>;
      }
      
      return (dynamicIconImports[safeIconKey] ? 
        dynamicIconImports[safeIconKey]() : 
        Promise.reject(new Error(`Icon ${name} (${iconKey}) not found`))
      ).then((module): IconModule => {
        return module as IconModule;
      }).catch((error: Error) => {
        console.error(`[icons] Failed to load dynamic icon: ${name}`, error);
        // Return a properly typed object with default property
        return {
          default: (props: LucideProps) => <IconFallback name={name} {...props} />
        } as IconModule;
      });
    });

    return (
      <Suspense fallback={<IconFallback name={name} {...props} />}>
        <DynamicIcon ref={ref} {...props} />
      </Suspense>
    );
  }
);

// -- Export commonly used icons as lazy-loaded components --

export const LogOut = createLazyIcon('log-out');
export const LogIn = createLazyIcon('log-in');
export const LayoutDashboard = createLazyIcon('layout-dashboard');
export const ChevronDown = createLazyIcon('chevron-down');
export const Loader2 = createLazyIcon('loader-2');
export const BarChart = createLazyIcon('bar-chart');
export const Users = createLazyIcon('users');
export const Home = createLazyIcon('home');
export const MessageSquare = createLazyIcon('message-square');
export const Calendar = createLazyIcon('calendar');
export const HelpCircle = createLazyIcon('help-circle');
export const Check = createLazyIcon('check');
export const X = createLazyIcon('x');
export const User = createLazyIcon('user');
export const Target = createLazyIcon('target');
export const BookOpen = createLazyIcon('book-open');
export const Receipt = createLazyIcon('receipt');
export const HandHeart = createLazyIcon('hand-heart');
export const Headphones = createLazyIcon('headphones');
export const PlayCircle = createLazyIcon('play-circle');
export const PauseCircle = createLazyIcon('pause-circle');
export const EyeIcon = createLazyIcon('eye');
export const EyeOffIcon = createLazyIcon('eye-off');
export const Loader = createLazyIcon('loader');
export const ArrowRight = createLazyIcon('arrow-right');
export const ArrowLeftIcon = createLazyIcon('arrow-left');
export const MailIcon = createLazyIcon('mail');
export const Edit = createLazyIcon('edit');
export const Trash2 = createLazyIcon('trash-2');
export const MoreHorizontal = createLazyIcon('more-horizontal');
export const Pill = createLazyIcon('pill');
export const PlusCircle = createLazyIcon('plus-circle');
export const Plus = createLazyIcon('plus');
export const Bell = createLazyIcon('bell');
export const ChevronUp = createLazyIcon('chevron-up');
