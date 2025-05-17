/**
 * Static icon fallback system that doesn't depend on React initialization
 * Provides DOM-based icon rendering when React isn't ready yet
 */

// Track which icons we've created static fallbacks for (for debugging)
const staticIconUsage: Record<string, number> = {};

// Configuration for static icons
interface StaticIconConfig {
  size?: number; // Updated to only accept number
  color?: string;
  className?: string;
  strokeWidth?: number;
}

/**
 * Create a pure DOM-based SVG icon that doesn't depend on React
 * This is used as a fallback when React isn't initialized yet
 */
export function createStaticIcon(
  iconName: string,
  config: StaticIconConfig = {}
): HTMLElement {
  try {
    // Extract configuration with defaults
    const { 
      size = 24, 
      color = 'currentColor',
      className = '',
      strokeWidth = 2
    } = config;
    
    // Convert size to pixels for SVG attribute
    const sizeValue = `${size}px`;
    
    // Create the SVG element
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', sizeValue);
    svgElement.setAttribute('height', sizeValue);
    svgElement.setAttribute('viewBox', '0 0 24 24');
    svgElement.setAttribute('fill', 'none');
    svgElement.setAttribute('stroke', color);
    svgElement.setAttribute('stroke-width', strokeWidth.toString());
    svgElement.setAttribute('stroke-linecap', 'round');
    svgElement.setAttribute('stroke-linejoin', 'round');
    
    // Add any provided classes
    if (className) {
      svgElement.setAttribute('class', `lucide-icon ${className}`);
    } else {
      svgElement.setAttribute('class', 'lucide-icon');
    }
    
    // Create the path based on the icon name
    const path = getPathForIcon(iconName);
    if (path) {
      // If we have a specific path for this icon, use it
      if (Array.isArray(path)) {
        path.forEach(pathData => {
          const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathElement.setAttribute('d', pathData);
          svgElement.appendChild(pathElement);
        });
      } else {
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', path);
        svgElement.appendChild(pathElement);
      }
    } else {
      // Generic fallback for unknown icons (question mark)
      const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circleElement.setAttribute('cx', '12');
      circleElement.setAttribute('cy', '12');
      circleElement.setAttribute('r', '10');
      svgElement.appendChild(circleElement);
      
      const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElement.setAttribute('x', '12');
      textElement.setAttribute('y', '16');
      textElement.setAttribute('text-anchor', 'middle');
      textElement.setAttribute('fill', color);
      textElement.setAttribute('stroke', 'none');
      textElement.textContent = '?';
      svgElement.appendChild(textElement);
    }
    
    // Create a wrapper to match the React component structure
    const wrapper = document.createElement('span');
    wrapper.style.display = 'inline-flex';
    wrapper.appendChild(svgElement);
    
    // Track usage for debugging
    trackStaticIconUsage(iconName);
    
    return wrapper;
  } catch (error) {
    console.error(`[iconFallbacks] Error creating static icon for ${iconName}:`, error);
    
    // If SVG creation fails, return a simple text fallback
    const fallback = document.createElement('span');
    fallback.textContent = iconName;
    fallback.style.display = 'inline-block';
    
    // Make sure we use a number for size
    const displaySize = `${config.size || 24}px`;
    fallback.style.width = displaySize;
    fallback.style.height = displaySize;
    fallback.style.border = '1px dashed currentColor';
    fallback.style.borderRadius = '4px';
    fallback.style.padding = '2px';
    fallback.style.fontSize = '10px';
    
    fallback.style.color = config.color || 'currentColor';
    fallback.style.textAlign = 'center';
    fallback.style.overflow = 'hidden';
    
    return fallback;
  }
}

// Track static icon usage for diagnostic purposes
export function trackStaticIconUsage(iconName: string): void {
  staticIconUsage[iconName] = (staticIconUsage[iconName] || 0) + 1;
  
  // Log first usage of each icon type
  if (staticIconUsage[iconName] === 1) {
    console.log(`[iconFallbacks] Created static fallback for "${iconName}" icon`);
  }
}

// Get the current static icon usage stats
export function getStaticIconUsageStats(): Record<string, number> {
  return { ...staticIconUsage };
}

/**
 * Register icon system as ready
 * This should be called when the icon system is ready for use
 */
export function registerIconsAsReady(): void {
  console.log('[iconFallbacks] Registering icons as ready');
  if (typeof window !== 'undefined') {
    // Use a custom event that components can listen for
    window.dispatchEvent(new CustomEvent('IconSystemReady'));
    
    // Also register with the module tracker if available
    try {
      const moduleTracker = require('./moduleInitTracker');
      moduleTracker.registerModuleInit('icons');
      
      // Also register with the bootstrap system if available
      const appBootstrap = require('./appBootstrap');
      if (typeof appBootstrap.registerIconsReady === 'function') {
        appBootstrap.registerIconsReady();
      }
    } catch (error) {
      // Ignore if the module tracker isn't available
    }
  }
}

// Preload static icons for common icons to ensure they're ready
export function preloadStaticIcons(): void {
  if (typeof window !== 'undefined' && !window._staticIconsPreloaded) {
    window._staticIconsPreloaded = true;
    
    // Create and immediately discard static versions of common icons
    // This ensures the code paths are warm when they're needed
    [
      'LogOut', 'LogIn', 'LayoutDashboard', 'ChevronDown', 'Loader2',
      'BarChart', 'Users', 'Home', 'MessageSquare', 'Calendar'
    ].forEach(iconName => {
      createStaticIcon(iconName);
    });
    
    console.log('[iconFallbacks] Preloaded static icons');
  }
}

// Path data for common icons to avoid network requests
// Only include the most commonly used icons
function getPathForIcon(iconName: string): string | string[] | null {
  const paths: Record<string, string | string[]> = {
    'LogOut': 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
    'LogIn': 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3',
    'LayoutDashboard': 'M3 3h7v9H3zm11 0h7v5h-7zm0 9h7v9h-7zm-11 0h7v5H3z',
    'ChevronDown': 'M6 9l6 6 6-6',
    'Loader2': 'M21 12a9 9 0 1 1-6.219-8.56',
    'Users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    'Home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    'MessageSquare': 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    'Calendar': 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18',
    'HelpCircle': 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01'
  };
  
  return paths[iconName] || null;
}

// Initialize the icon system
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Register as ready after a short delay to ensure other systems are ready
    setTimeout(() => {
      registerIconsAsReady();
    }, 100);
  });
}
