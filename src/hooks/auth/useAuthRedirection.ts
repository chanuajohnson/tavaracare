
import { useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';

export const useAuthRedirection = (
  user: User | null,
  userRole: UserRole | null,
  checkProfileCompletion: (userId: string) => Promise<boolean>,
  safeNavigate: (path: string, options: any) => void,
  checkPendingUpvote: () => Promise<void>
) => {
  const location = useLocation();
  const isRedirectingRef = { current: false };

  const handlePostLoginRedirection = async () => {
    if (!user || isRedirectingRef.current) return;

    // Skip redirect on reset password page
    if (location.pathname.includes('/auth/reset-password/confirm')) {
      console.log('[AuthProvider] On reset password confirmation page, skipping redirection');
      return;
    }

    // Check for email verification callback parameters
    const isEmailVerification = location.search.includes('access_token=') || 
                               location.search.includes('type=signup') || 
                               location.search.includes('auth_redirect=true');
                               
    if (isEmailVerification) {
      console.log('[AuthProvider] Email verification detected in URL parameters');
      // Make sure to clear any flags that might prevent redirection
      sessionStorage.removeItem('skipPostLoginRedirect');
    }

    const skipRedirect = sessionStorage.getItem('skipPostLoginRedirect');
    if (skipRedirect && !isEmailVerification) {
      console.log('[AuthProvider] Skipping post-login redirect due to skipPostLoginRedirect flag');
      return;
    }
    
    isRedirectingRef.current = true;
    
    try {
      console.log('[AuthProvider] Handling post-login redirection for user:', user.id);
      
      let effectiveRole = userRole;
      if (!effectiveRole && user.user_metadata?.role) {
        console.log('[AuthProvider] Setting user role from metadata:', user.user_metadata.role);
        effectiveRole = user.user_metadata.role;
      }

      // If still no role, try to get it from localStorage (from registration)
      if (!effectiveRole) {
        const storedRole = localStorage.getItem('registeringAs') || localStorage.getItem('registrationRole');
        if (storedRole) {
          console.log('[AuthProvider] Setting user role from localStorage:', storedRole);
          effectiveRole = storedRole as UserRole;
        }
      }

      const locationState = location.state as { returnPath?: string; action?: string } | null;
      if (locationState?.returnPath === "/family/story" && locationState?.action === "tellStory") {
        safeNavigate('/family/story', { skipCheck: true });
        isRedirectingRef.current = false;
        return;
      }

      // Handle various redirection cases
      const pendingFeatureId = localStorage.getItem('pendingFeatureId');
      if (pendingFeatureId) {
        await checkPendingUpvote();
        isRedirectingRef.current = false;
        return;
      }

      // Check profile completion and redirect accordingly
      const profileComplete = await checkProfileCompletion(user.id);
      
      if (effectiveRole) {
        const dashboardRoutes: Record<UserRole, string> = {
          'family': '/dashboard/family',
          'professional': '/dashboard/professional',
          'community': '/dashboard/community',
          'admin': '/dashboard/admin'
        };
        
        safeNavigate(dashboardRoutes[effectiveRole], { skipCheck: true });
      } else {
        safeNavigate('/', { skipCheck: true });
      }
    } catch (error) {
      console.error('[AuthProvider] Error during post-login redirection:', error);
    } finally {
      isRedirectingRef.current = false;
    }
  };

  return { handlePostLoginRedirection };
};
