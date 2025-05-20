
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log('[RedirectHandler] Checking for redirects', { 
      pathname: location.pathname, 
      search: location.search,
      hash: location.hash
    });
    
    // Handle general redirects from query params
    const params = new URLSearchParams(location.search);
    const routeParam = params.get('route');
    
    // Handle regular route redirects
    if (routeParam) {
      const newUrl = '/' + routeParam;
      console.log(`[RedirectHandler] Redirecting to: ${newUrl}`);
      navigate(newUrl, { replace: true });
    }
    
    // Handle hash-based redirects for auth flows (from 404.html)
    if (location.hash.startsWith('#/auth/reset-password/confirm')) {
      // Extract the path and query string from the hash
      const hashParts = location.hash.substring(1).split('?');
      const hashPath = hashParts[0];
      const hashQuery = hashParts.length > 1 ? `?${hashParts[1]}` : '';
      
      console.log(`[RedirectHandler] Auth redirect detected: ${hashPath}${hashQuery}`);
      
      // Navigate to the correct route with the query parameters
      navigate(`${hashPath}${hashQuery}`, { replace: true });
    }
  }, [location, navigate]);
  
  return null;
}
