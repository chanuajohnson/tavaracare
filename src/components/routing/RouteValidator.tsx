
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VALID_ROUTE_PATTERNS = [
  // Exact matches
  '/',
  '/auth',
  '/features',
  '/about',
  '/faq',
  
  // Registration routes
  '/registration/family',
  '/registration/professional', 
  '/registration/community',
  
  // Dashboard routes
  '/dashboard/family',
  '/dashboard/professional',
  '/dashboard/community',
  '/dashboard/admin',
  
  // Dynamic route patterns (regex)
  /^\/auth\/.*$/,
  /^\/family\/.*$/,
  /^\/professional\/.*$/,
  /^\/community\/.*$/,
  /^\/admin\/.*$/,
  /^\/subscription\/.*$/,
  /^\/caregiver\/.*$/,
  /^\/legacy\/.*$/,
  /^\/debug\/.*$/
];

export function RouteValidator() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if current route is valid
    const isValidRoute = VALID_ROUTE_PATTERNS.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === currentPath;
      } else {
        return pattern.test(currentPath);
      }
    });

    if (!isValidRoute) {
      console.warn(`[RouteValidator] Invalid route detected: ${currentPath}`);
      console.log('[RouteValidator] Redirecting to home page');
      
      // Small delay to prevent immediate redirect loops
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } else {
      console.log(`[RouteValidator] Valid route: ${currentPath}`);
    }
  }, [location.pathname, navigate]);

  return null;
}
