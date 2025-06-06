
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ensureUserProfile } from '@/lib/profile-utils';
import { UserRole } from '@/types/database';

const REDIRECT_TIMEOUT = 3000; // Reduced to 3 seconds for faster fallback
const VALID_ROUTES = [
  '/', '/auth', '/features', '/about', '/faq',
  '/registration/family', '/registration/professional', '/registration/community',
  '/dashboard/family', '/dashboard/professional', '/dashboard/community', '/dashboard/admin',
  '/family', '/professional', '/community', '/subscription'
];

export function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    console.log('[RedirectHandler] Checking for redirects', { 
      pathname: location.pathname, 
      search: location.search,
      hash: location.hash
    });
    
    // Only process if we have something to redirect
    if (!location.hash && !location.search.includes('route=') && !location.hash.includes('access_token=')) {
      return;
    }
    
    // Set processing state
    setIsProcessing(true);
    
    // Set up timeout fallback
    const timeoutId = setTimeout(() => {
      console.warn('[RedirectHandler] Redirect timeout - falling back to home');
      setIsProcessing(false);
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }, REDIRECT_TIMEOUT);
    
    try {
      processRedirects(timeoutId);
    } catch (error) {
      console.error('[RedirectHandler] Error processing redirects:', error);
      clearTimeout(timeoutId);
      setIsProcessing(false);
      // Fallback to home on error
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const processRedirects = async (timeoutId: NodeJS.Timeout) => {
    try {
      // Handle legacy query parameter redirects (from old 404.html)
      const params = new URLSearchParams(location.search);
      const routeParam = params.get('route');
      
      if (routeParam) {
        const targetRoute = '/' + routeParam;
        console.log(`[RedirectHandler] Legacy query redirect to: ${targetRoute}`);
        
        if (isValidRoute(targetRoute)) {
          clearTimeout(timeoutId);
          setIsProcessing(false);
          navigate(targetRoute, { replace: true });
          return;
        } else {
          console.warn(`[RedirectHandler] Invalid route: ${targetRoute}, redirecting to home`);
          clearTimeout(timeoutId);
          setIsProcessing(false);
          navigate('/', { replace: true });
          return;
        }
      }
      
      // Handle hash-based redirects (new approach from updated 404.html)
      if (location.hash && location.hash.startsWith('#/')) {
        const hashPath = location.hash.substring(1); // Remove the #
        const [path, queryString] = hashPath.split('?');
        
        console.log(`[RedirectHandler] Hash-based redirect detected: ${path}${queryString ? '?' + queryString : ''}`);
        
        if (isValidRoute(path)) {
          clearTimeout(timeoutId);
          setIsProcessing(false);
          
          // Handle auth routes with special care
          if (path.includes('/auth/reset-password/confirm')) {
            await handleEmailConfirmation(queryString);
          } else {
            // Navigate to the path with query parameters if present
            const fullPath = queryString ? `${path}?${queryString}` : path;
            navigate(fullPath, { replace: true });
          }
          return;
        } else {
          console.warn(`[RedirectHandler] Invalid hash route: ${path}, redirecting to home`);
          clearTimeout(timeoutId);
          setIsProcessing(false);
          navigate('/', { replace: true });
          return;
        }
      }

      // Handle email confirmation with authentication tokens (legacy approach)
      if (location.hash && location.hash.includes('access_token=')) {
        console.log('[RedirectHandler] Email confirmation tokens detected in hash');
        await handleEmailConfirmation();
        clearTimeout(timeoutId);
        setIsProcessing(false);
        return;
      }

      // If no special redirects needed, clear processing
      clearTimeout(timeoutId);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('[RedirectHandler] Error in processRedirects:', error);
      clearTimeout(timeoutId);
      setIsProcessing(false);
      navigate('/', { replace: true });
    }
  };

  const isValidRoute = (route: string): boolean => {
    // Check exact matches first
    if (VALID_ROUTES.includes(route)) {
      return true;
    }
    
    // Check dynamic routes
    const dynamicRoutes = [
      /^\/family\/.*$/,
      /^\/professional\/.*$/,
      /^\/community\/.*$/,
      /^\/admin\/.*$/,
      /^\/auth\/.*$/,
      /^\/subscription\/.*$/,
      /^\/caregiver\/.*$/,
      /^\/legacy\/.*$/,
      /^\/debug\/.*$/
    ];
    
    return dynamicRoutes.some(pattern => pattern.test(route));
  };

  const handleEmailConfirmation = async (queryString?: string) => {
    try {
      console.log('[RedirectHandler] Processing email confirmation');
      
      // Extract tokens from hash or query string
      let params: URLSearchParams;
      
      if (queryString) {
        params = new URLSearchParams(queryString);
      } else {
        params = new URLSearchParams(location.hash.substring(1));
      }
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      console.log('[RedirectHandler] Email confirmation params:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        type 
      });

      if (accessToken && refreshToken) {
        // Set the session with the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('[RedirectHandler] Error setting session:', error);
          // Clear hash and go to auth page on error
          window.history.replaceState({}, '', window.location.pathname);
          navigate('/auth', { replace: true });
          return;
        }

        if (data.user) {
          console.log('[RedirectHandler] Session established for user:', data.user.id);
          
          // Ensure user profile exists with role from metadata
          if (data.user.user_metadata?.role) {
            await ensureUserProfile(data.user.id, data.user.user_metadata.role);
          }

          // Clear the hash from URL
          window.history.replaceState({}, '', window.location.pathname);
          
          // Determine the user's role and redirect to appropriate dashboard
          const userRole = data.user.user_metadata?.role as UserRole;
          
          if (userRole) {
            const dashboardRoutes: Record<UserRole, string> = {
              'family': '/dashboard/family',
              'professional': '/dashboard/professional',
              'community': '/dashboard/community',
              'admin': '/dashboard/admin'
            };
            
            const targetDashboard = dashboardRoutes[userRole];
            
            if (targetDashboard) {
              console.log('[RedirectHandler] Email confirmation complete, redirecting to dashboard:', targetDashboard);
              navigate(targetDashboard, { replace: true });
              return;
            }
          }
          
          // Fallback to home if no role detected
          console.log('[RedirectHandler] No role detected, redirecting to home');
          navigate('/', { replace: true });
        }
      } else {
        console.warn('[RedirectHandler] Missing tokens in email confirmation');
        navigate('/auth', { replace: true });
      }
    } catch (error) {
      console.error('[RedirectHandler] Error in handleEmailConfirmation:', error);
      // Clear hash and go to auth page on error
      window.history.replaceState({}, '', window.location.pathname);
      navigate('/auth', { replace: true });
    }
  };
  
  // Don't render anything during processing to avoid flicker
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }
  
  return null;
}
