
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

    const skipRedirect = sessionStorage.getItem('skipPostLoginRedirect');
    if (skipRedirect) {
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
        
        const targetDashboard = dashboardRoutes[effectiveRole];
        
        // Check if user is already on the correct dashboard - if so, don't redirect
        if (location.pathname === targetDashboard) {
          console.log('[AuthProvider] User already on correct dashboard, skipping redirect');
          isRedirectingRef.current = false;
          return;
        }
        
        // Only redirect to dashboard if not already there
        safeNavigate(targetDashboard, { skipCheck: true });
      } else {
        // Only redirect to home if not already on correct dashboard
        if (location.pathname !== '/') {
          safeNavigate('/', { skipCheck: true });
        }
      }
    } catch (error) {
      console.error('[AuthProvider] Error during post-login redirection:', error);
    } finally {
      isRedirectingRef.current = false;
    }
  };

  return { handlePostLoginRedirection };
};
