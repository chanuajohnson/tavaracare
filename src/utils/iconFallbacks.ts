
/**
 * Pure HTML/CSS icon fallbacks (no React dependencies)
 * These can be used during early initialization before React is loaded
 */

// Type for icon properties
export interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
  [key: string]: any;
}

/**
 * Create a DOM element for a fallback icon
 */
export function createFallbackIconElement(props: IconProps = {}): HTMLElement {
  const { size = 24, className = '', color = 'currentColor' } = props;
  
  // Create a simple div placeholder that mimics an icon's dimensions
  const iconElement = document.createElement('span');
  iconElement.className = `icon-fallback ${className}`;
  
  // Apply styling
  Object.assign(iconElement.style, {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    display: 'inline-block',
    color: color,
    verticalAlign: 'middle',
    position: 'relative'
  });
  
  return iconElement;
}

/**
 * Map of static HTML for common icons, useful during early initialization
 */
export const staticIconHtml: Record<string, string> = {
  Menu: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  LogIn: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`,
  LogOut: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  Home: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  LayoutDashboard: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
  ChevronDown: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  Loader2: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`,
  // Adding more common icons for broader coverage
  User: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  Calendar: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  Settings: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  UserPlus: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`,
  MessageSquare: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
};

/**
 * Create an HTML element with the icon SVG
 */
export function createStaticIcon(iconName: string, props: IconProps = {}): HTMLElement {
  const { size = 24, color = 'currentColor', className = '' } = props;
  
  const iconElement = document.createElement('span');
  iconElement.className = `static-icon ${className}`;
  
  // Set styles
  Object.assign(iconElement.style, {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    display: 'inline-block',
    color: color,
    verticalAlign: 'middle'
  });
  
  // Use the static SVG if available, otherwise use fallback
  if (staticIconHtml[iconName]) {
    iconElement.innerHTML = staticIconHtml[iconName];
    
    // Update the SVG size and color
    const svg = iconElement.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', typeof size === 'number' ? `${size}px` : size);
      svg.setAttribute('height', typeof size === 'number' ? `${size}px` : size);
      svg.setAttribute('stroke', color);
    }
  } else {
    // Create a fallback if this icon isn't in our static collection
    iconElement.textContent = iconName.charAt(0);
    iconElement.style.textAlign = 'center';
    iconElement.style.lineHeight = typeof size === 'number' ? `${size}px` : size;
    iconElement.style.backgroundColor = '#eee';
    iconElement.style.borderRadius = '3px';
  }
  
  return iconElement;
}

/**
 * Check if the DOM is ready for manipulation
 */
export function isDomReady(): boolean {
  return document.readyState === 'complete' || document.readyState === 'interactive';
}

/**
 * Insert a static icon into the DOM at a given selector
 */
export function insertStaticIcon(selector: string, iconName: string, props: IconProps = {}): void {
  if (!isDomReady()) {
    document.addEventListener('DOMContentLoaded', () => {
      insertStaticIcon(selector, iconName, props);
    });
    return;
  }
  
  const container = document.querySelector(selector);
  if (container) {
    // Clear previous children if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(createStaticIcon(iconName, props));
  }
}

/**
 * Preload all static icons to ensure they're available
 * This can be called very early in the page lifecycle
 */
export function preloadStaticIcons(): void {
  // Only create this object once
  if (typeof window !== 'undefined' && !window._staticIconsPreloaded) {
    window._staticIconsPreloaded = true;
    
    // Safety check - don't try to manipulate DOM before it's ready
    const loadIcons = () => {
      // Check if container already exists to avoid duplicates
      if (document.getElementById('static-icons-preload')) {
        return;
      }
      
      // Create a hidden container for preloaded icons
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.visibility = 'hidden';
      container.style.pointerEvents = 'none';
      container.style.width = '0';
      container.style.height = '0';
      container.style.overflow = 'hidden';
      container.id = 'static-icons-preload';
      
      // Add all icons to this container
      Object.keys(staticIconHtml).forEach(iconName => {
        try {
          const iconEl = createStaticIcon(iconName);
          container.appendChild(iconEl);
        } catch (e) {
          console.error(`[iconFallbacks] Error preloading icon ${iconName}:`, e);
        }
      });
      
      // Add to DOM when ready
      if (document.body) {
        document.body.appendChild(container);
      }
    };
    
    // Wait for DOM to be ready
    if (isDomReady() && document.body) {
      loadIcons();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadIcons, 10); // Small delay to ensure body is available
      });
    }
    
    console.log('[iconFallbacks] Static icons preloaded');
  }
}

// Register icons as ready once preloaded
if (typeof window !== 'undefined') {
  // Safely import and use appBootstrap with fallback
  const registerIcons = () => {
    try {
      const { registerIconsReady } = require('./appBootstrap');
      if (typeof registerIconsReady === 'function') {
        console.log('[iconFallbacks] Registering icons as ready');
        registerIconsReady();
      }
    } catch (e) {
      console.error('[iconFallbacks] Could not register icons as ready:', e);
    }
  };
  
  // Register after icons are preloaded
  if (document.readyState === 'complete') {
    setTimeout(registerIcons, 100);
  } else {
    window.addEventListener('load', () => {
      setTimeout(registerIcons, 100);
    });
  }
}

// Call preload immediately
if (typeof window !== 'undefined') {
  // Try to preload as early as possible
  setTimeout(preloadStaticIcons, 0);
}

// Add the preloaded flag to Window
declare global {
  interface Window {
    _staticIconsPreloaded?: boolean;
  }
}
