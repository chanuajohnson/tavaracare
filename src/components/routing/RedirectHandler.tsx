
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { extractResetTokens } from '@/utils/authResetUtils';

export function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Handle general redirects from query params
    const params = new URLSearchParams(location.search);
    const routeParam = params.get('route');
    
    // Handle auth-specific redirects (password reset)
    const accessToken = params.get('access_token');
    const type = params.get('type');
    const hash = location.hash;
    
    console.log("🔍 RedirectHandler checking URL:", {
      path: location.pathname,
      search: location.search,
      hash,
      type,
      hasToken: !!accessToken
    });

    if (accessToken || type === 'recovery' || hash.includes('access_token') || hash.includes('type=recovery')) {
      // If we're already on the confirm page, don't redirect
      if (!location.pathname.includes('/reset-password/confirm')) {
        console.log("↪️ Redirecting to password reset confirmation");
        navigate('/auth/reset-password/confirm', { 
          replace: true,
          state: { 
            access_token: accessToken,
            type,
            hash
          }
        });
        return;
      }
    }
    
    // Handle regular route redirects
    if (routeParam) {
      const newUrl = '/' + routeParam;
      navigate(newUrl, { replace: true });
    }
  }, [location, navigate]);
  
  return null;
}
