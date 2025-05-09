
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log('[RedirectHandler] Checking for redirects', { 
      pathname: location.pathname, 
      search: location.search,
      hash: location.hash
    });
    
    // Handle auth redirects from email verification
    const params = new URLSearchParams(location.search);
    const isAuthRedirect = params.get('auth_redirect') === 'true';
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');
    
    // Handle email verification redirects
    if (isAuthRedirect || accessToken || type === 'signup') {
      console.log('[RedirectHandler] Email verification detected');
      
      // Clear any flags that might prevent redirection
      sessionStorage.removeItem('skipPostLoginRedirect');
      
      // Get the role from localStorage (set during signup)
      const role = localStorage.getItem('registeringAs') || localStorage.getItem('registrationRole');
      console.log('[RedirectHandler] Stored role:', role);
      
      if (role) {
        // Construct the dashboard URL based on the user's role
        const dashboardRoute = `/dashboard/${role}`;
        console.log(`[RedirectHandler] Will redirect to dashboard: ${dashboardRoute}`);
        
        // Set a small delay to allow auth state to update first
        setTimeout(() => {
          // We don't navigate immediately to give time for Supabase's automatic session handling to work
          navigate(dashboardRoute, { replace: true });
          toast.success('Email verified! Welcome to your dashboard.');
          
          // Scroll to top of the page after navigation
          window.scrollTo(0, 0);
        }, 1000);
        
        return;
      }
    }
    
    // Handle general redirects from query params
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
