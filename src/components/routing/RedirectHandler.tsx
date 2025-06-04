
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ensureUserProfile } from '@/lib/profile-utils';

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
      return;
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
      return;
    }

    // Handle email confirmation with authentication tokens
    if (location.hash && location.hash.includes('access_token=')) {
      console.log('[RedirectHandler] Email confirmation tokens detected');
      handleEmailConfirmation();
    }
  }, [location, navigate]);

  const handleEmailConfirmation = async () => {
    try {
      // Extract tokens from hash
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresAt = hashParams.get('expires_at');
      const tokenType = hashParams.get('token_type');
      const type = hashParams.get('type');

      console.log('[RedirectHandler] Processing email confirmation:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        type 
      });

      if (accessToken && refreshToken && expiresAt) {
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
          
          // Let AuthProvider handle the redirect to role-based dashboard
          // Don't navigate manually here - let the existing auth flow handle it
          console.log('[RedirectHandler] Email confirmation complete, letting AuthProvider handle redirect');
        }
      }
    } catch (error) {
      console.error('[RedirectHandler] Error in handleEmailConfirmation:', error);
      // Clear hash and go to auth page on error
      window.history.replaceState({}, '', window.location.pathname);
      navigate('/auth', { replace: true });
    }
  };
  
  return null;
}
