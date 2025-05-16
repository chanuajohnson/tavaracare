
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
  Loader2: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`
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
    container.innerHTML = '';
    container.appendChild(createStaticIcon(iconName, props));
  }
}
