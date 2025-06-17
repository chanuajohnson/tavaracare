import { useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';
import { startTransition } from 'react';
import { ensureUserProfile } from '@/lib/profile-utils';
import { shouldSkipRedirectForCurrentFlow, hasAuthFlowFlag, AUTH_FLOW_FLAGS } from '@/utils/authFlowUtils';

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

    // Skip redirect on family-specific pages like care assessment
    if (location.pathname.startsWith('/family/')) {
      console.log('[AuthProvider] On family page, skipping redirection');
      return;
    }

    // CRITICAL FIX: Check for email verification flag specifically
    const skipEmailVerification = hasAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
    if (skipEmailVerification) {
      console.log('[AuthProvider] SKIPPING handlePostLoginRedirection - email verification redirect flag is active');
      return;
    }

    // Use the new specific auth flow flags instead of the old broad flag
    if (shouldSkipRedirectForCurrentFlow()) {
      console.log('[AuthProvider] Skipping post-login redirect due to specific auth flow flags');
      return;
    }
    
    isRedirectingRef.current = true;
    
    try {
      console.log('[AuthProvider] Handling post-login redirection for user:', user.id);
      
      let effectiveRole = userRole;
      
      // If no role detected, ensure profile exists and try to get role from metadata
      if (!effectiveRole && user.user_metadata?.role) {
        console.log('[AuthProvider] No role detected, ensuring profile exists with metadata role:', user.user_metadata.role);
        await ensureUserProfile(user.id, user.user_metadata.role);
        effectiveRole = user.user_metadata.role;
      }

      const locationState = location.state as { returnPath?: string; action?: string } | null;
      if (locationState?.returnPath === "/family/story" && locationState?.action === "tellStory") {
        startTransition(() => {
          safeNavigate('/family/story', { skipCheck: true });
        });
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

      // Check profile completion for informational purposes, but don't redirect based on it
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

        // Check if user is on a registration page that matches their role
        const registrationRoutes: Record<UserRole, string> = {
          'family': '/registration/family',
          'professional': '/registration/professional',
          'community': '/registration/community',
          'admin': '/dashboard/admin'
        };

        const targetRegistration = registrationRoutes[effectiveRole];
        
        // If user is on the correct registration page, don't redirect
        if (location.pathname === targetRegistration) {
          console.log('[AuthProvider] User on correct registration page, skipping redirect');
          isRedirectingRef.current = false;
          return;
        }
        
        // Always redirect to dashboard regardless of profile completion status
        // Dashboard will show appropriate next steps for incomplete profiles
        console.log('[AuthProvider] Redirecting to dashboard:', targetDashboard, 'Profile complete:', profileComplete);
        startTransition(() => {
          safeNavigate(targetDashboard, { skipCheck: true });
        });
      } else {
        // Only redirect to home if not already on correct dashboard
        if (location.pathname !== '/') {
          console.log('[AuthProvider] No role detected, redirecting to home');
          startTransition(() => {
            safeNavigate('/', { skipCheck: true });
          });
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
