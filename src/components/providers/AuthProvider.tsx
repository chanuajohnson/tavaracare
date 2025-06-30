
import { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';
import { toast } from 'sonner';
import LoadingScreen from '../common/LoadingScreen';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useProfileCompletion } from '@/hooks/auth/useProfileCompletion';
import { useAuthRedirection } from '@/hooks/auth/useAuthRedirection';
import { useFeatureUpvote } from '@/hooks/auth/useFeatureUpvote';
import { shouldSkipRedirectForCurrentFlow, AUTH_FLOW_FLAGS, hasAuthFlowFlag, clearAllAuthFlowFlags } from '@/utils/authFlowUtils';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
  requireAuth: (action: string, redirectPath?: string) => boolean;
  clearLastAction: () => void;
  checkPendingUpvote: () => Promise<void>;
  isProfileComplete: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userRole: null,
  signOut: async () => {},
  isLoading: true,
  requireAuth: () => false,
  clearLastAction: () => {},
  checkPendingUpvote: async () => {},
  isProfileComplete: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    session,
    setSession,
    user,
    setUser,
    userRole,
    setUserRole,
    isLoading,
    setLoadingWithTimeout,
    isProfileComplete,
    setIsProfileComplete,
    clearLoadingTimeout,
    isInitializedRef,
    lastOperationRef,
    authInitializedRef
  } = useAuthSession();

  const {
    safeNavigate,
    initialRedirectionDoneRef,
  } = useAuthNavigation();

  const { checkProfileCompletion } = useProfileCompletion(setUserRole, setIsProfileComplete);
  const { checkPendingUpvote } = useFeatureUpvote(user, safeNavigate);
  const { handlePostLoginRedirection } = useAuthRedirection(
    user,
    userRole,
    checkProfileCompletion,
    safeNavigate,
    checkPendingUpvote
  );

  const location = useLocation();
  const isPasswordResetConfirmRoute = location.pathname.includes('/auth/reset-password/confirm');
  const isPasswordRecoveryRef = useRef(false);
  const passwordResetCompleteRef = useRef(false);

  // Enhanced role detection with database fallback
  const detectUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      console.log('[AuthProvider] DETECTING role for user:', userId);
      
      // First check user metadata (fastest)
      if (user?.user_metadata?.role) {
        const metadataRole = user.user_metadata.role as UserRole;
        console.log('[AuthProvider] Role found in metadata:', metadataRole);
        return metadataRole;
      }

      // Fallback to database query
      console.log('[AuthProvider] No metadata role, querying database...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthProvider] Error fetching role from database:', error);
        return null;
      }

      if (profile?.role) {
        console.log('[AuthProvider] Role found in database:', profile.role);
        return profile.role as UserRole;
      }

      console.warn('[AuthProvider] No role found in metadata or database for user:', userId);
      return null;
    } catch (error) {
      console.error('[AuthProvider] Error in detectUserRole:', error);
      return null;
    }
  };

  // Clear problematic flags and force role detection
  const forceRoleDetectionAndRedirect = async (currentUser: User) => {
    try {
      console.log('[AuthProvider] FORCING role detection for user:', currentUser.id);
      
      // Clear any problematic auth flow flags
      clearAllAuthFlowFlags();
      
      // Clear any redirect locks
      sessionStorage.removeItem('TAVARA_REDIRECT_LOCK');
      sessionStorage.removeItem('TAVARA_REDIRECT_LOCK_TIME');
      
      // Force role detection
      const detectedRole = await detectUserRole(currentUser.id);
      
      if (detectedRole) {
        console.log('[AuthProvider] Role detected, setting and redirecting:', detectedRole);
        setUserRole(detectedRole);
        
        // Force redirect based on role
        const dashboardRoutes: Record<UserRole, string> = {
          'family': '/dashboard/family',
          'professional': '/dashboard/professional',
          'community': '/dashboard/community',
          'admin': '/dashboard/admin'
        };
        
        const targetDashboard = dashboardRoutes[detectedRole];
        
        // Only redirect if user is on wrong dashboard
        if (location.pathname !== targetDashboard) {
          console.log('[AuthProvider] Redirecting from', location.pathname, 'to', targetDashboard);
          toast.success(`Welcome to your ${detectedRole} dashboard!`);
          safeNavigate(targetDashboard, { replace: true });
        }
      } else {
        console.warn('[AuthProvider] Could not detect role, staying on current page');
      }
    } catch (error) {
      console.error('[AuthProvider] Error in forceRoleDetectionAndRedirect:', error);
    }
  };

  // ENHANCED: Detect development environment for better handling
  const isDevelopment = window.location.hostname.includes('lovable.app') || 
                       window.location.hostname === 'localhost';

  // Helper function to check for redirect lock with development override
  const hasRedirectLock = () => {
    if (isDevelopment) {
      // In development, be more lenient with redirect locks
      const lockTime = sessionStorage.getItem('TAVARA_REDIRECT_LOCK_TIME');
      if (lockTime) {
        const timeDiff = Date.now() - parseInt(lockTime);
        // Clear lock after 3 seconds in development
        if (timeDiff > 3000) {
          clearRedirectLock();
          return false;
        }
      }
    }
    return sessionStorage.getItem('TAVARA_REDIRECT_LOCK') === 'true';
  };

  // ENHANCED: Helper function to set redirect lock with timestamp
  const setRedirectLock = () => {
    sessionStorage.setItem('TAVARA_REDIRECT_LOCK', 'true');
    sessionStorage.setItem('TAVARA_REDIRECT_LOCK_TIME', Date.now().toString());
  };

  // Helper function to clear redirect lock
  const clearRedirectLock = () => {
    sessionStorage.removeItem('TAVARA_REDIRECT_LOCK');
    sessionStorage.removeItem('TAVARA_REDIRECT_LOCK_TIME');
  };
  
  useEffect(() => {
    console.log('[AuthProvider] Route changed to:', location.pathname);
    
    // Check if we're on the reset password page
    if (isPasswordResetConfirmRoute) {
      console.log('[AuthProvider] On password reset confirmation page');
      isPasswordRecoveryRef.current = true;
      setLoadingWithTimeout(false, 'reset-page-detected');
      return;
    }
    
    // Check if password reset was completed
    if (sessionStorage.getItem('passwordResetComplete')) {
      console.log('[AuthProvider] Password reset completed, clearing recovery state');
      isPasswordRecoveryRef.current = false;
      passwordResetCompleteRef.current = true;
      sessionStorage.removeItem('passwordResetComplete');
    }

    // ENHANCED: Clear redirect lock when navigating to auth page
    if (location.pathname === '/auth') {
      console.log('[AuthProvider] On auth page, clearing any redirect locks');
      clearRedirectLock();
    }
  }, [location.pathname]);

  const requireAuth = (action: string, redirectPath?: string) => {
    if (user) return true;

    localStorage.setItem('lastAction', action);
    localStorage.setItem('lastPath', redirectPath || location.pathname + location.search);
    
    if (action.startsWith('upvote "')) {
      const featureId = localStorage.getItem('pendingFeatureId');
      if (featureId) {
        localStorage.setItem('pendingFeatureUpvote', featureId);
      }
    }
    
    toast.error('Please sign in to ' + action);
    safeNavigate('/auth', { 
      skipCheck: true,
      state: {
        returnPath: redirectPath,
        action: action === 'tell their story' ? 'tellStory' : null
      }
    });
    return false;
  };

  const clearLastAction = () => {
    console.log('[AuthProvider] Clearing last action');
    localStorage.removeItem('lastAction');
    localStorage.removeItem('lastPath');
    localStorage.removeItem('pendingFeatureId');
    localStorage.removeItem('pendingFeatureUpvote');
  };

  const signOut = async () => {
    try {
      console.log('[AuthProvider] Signing out...');
      setLoadingWithTimeout(true, 'sign-out');
      
      // ENHANCED: Clear redirect locks on sign out
      clearRedirectLock();
      clearAllAuthFlowFlags();
      
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsProfileComplete(false);
      
      localStorage.removeItem('authStateError');
      localStorage.removeItem('authTimeoutRecovery');
      localStorage.removeItem('registrationRole');
      localStorage.removeItem('registeringAs');
      
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      
      safeNavigate('/', { skipCheck: true, replace: true });
      toast.success('You have been signed out successfully');
      
      setLoadingWithTimeout(false, 'sign-out-complete');
    } catch (error: any) {
      console.error('[AuthProvider] Error in signOut:', error);
      setSession(null);
      setUser(null);
      setUserRole(null);
      clearRedirectLock();
      clearAllAuthFlowFlags();
      setLoadingWithTimeout(false, 'sign-out-error');
      safeNavigate('/', { skipCheck: true });
      toast.success('You have been signed out successfully');
    }
  };

  // CRITICAL: Force role detection when user is on wrong dashboard
  useEffect(() => {
    if (user && !isLoading && !isPasswordRecoveryRef.current) {
      const isOnWrongDashboard = (
        (location.pathname === '/dashboard/family' && userRole === 'professional') ||
        (location.pathname === '/dashboard/professional' && userRole === 'family') ||
        (location.pathname === '/dashboard/community' && userRole !== 'community') ||
        (location.pathname === '/dashboard/admin' && userRole !== 'admin')
      );

      if (isOnWrongDashboard || !userRole) {
        console.log('[AuthProvider] User on wrong dashboard or no role detected, forcing role detection');
        forceRoleDetectionAndRedirect(user);
      }
    }
  }, [user, userRole, location.pathname, isLoading]);

  // ENHANCED: Handle post-login redirection with improved development support
  useEffect(() => {
    // CRITICAL: Check skip flags first
    const skipEmailVerification = hasAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
    const skipRedirectForFlow = shouldSkipRedirectForCurrentFlow();
    const currentRedirectLock = hasRedirectLock();
    
    console.log('[AuthProvider] ENHANCED Redirect check:', {
      isLoading,
      hasUser: !!user,
      hasSession: !!session,
      userRole,
      isPasswordResetRoute: isPasswordResetConfirmRoute,
      isPasswordRecovery: isPasswordRecoveryRef.current,
      skipEmailVerification,
      skipRedirectForFlow,
      hasRedirectLock: currentRedirectLock,
      location: location.pathname,
      isDevelopment,
      userMetadata: user?.user_metadata
    });
    
    const shouldSkipRedirect = 
      isLoading || 
      !user || 
      !session ||
      isPasswordResetConfirmRoute || 
      isPasswordRecoveryRef.current ||
      skipRedirectForFlow ||
      currentRedirectLock;
    
    if (shouldSkipRedirect) {
      if (skipEmailVerification) {
        console.log('[AuthProvider] SKIPPING post-login redirect - email verification flag is active');
      } else if (skipRedirectForFlow) {
        console.log('[AuthProvider] SKIPPING post-login redirect due to other auth flow flags');
      } else if (currentRedirectLock) {
        console.log('[AuthProvider] SKIPPING post-login redirect - redirect lock is active');
        // ENHANCED: In development, auto-clear locks after user interaction
        if (isDevelopment && location.pathname === '/auth') {
          setTimeout(() => {
            console.log('[AuthProvider] Development mode: Auto-clearing redirect lock after 2s');
            clearRedirectLock();
          }, 2000);
        }
      }
      return;
    }
    
    console.log('[AuthProvider] User loaded. Handling redirection...');
    
    // ENHANCED: Always attempt redirection if user is on auth page with valid session
    if (location.pathname === '/auth' || !initialRedirectionDoneRef.current) {
      console.log('[AuthProvider] Setting redirect lock and handling redirection');
      setRedirectLock();
      
      // Force role detection before redirection
      if (user && !userRole) {
        console.log('[AuthProvider] No role detected, forcing role detection before redirect');
        forceRoleDetectionAndRedirect(user);
      } else {
        handlePostLoginRedirection();
      }
      
      initialRedirectionDoneRef.current = true;
      
      // ENHANCED: Shorter clear timeout for development
      const clearTimeout = isDevelopment ? 1500 : 2000;
      setTimeout(() => {
        console.log('[AuthProvider] Clearing redirect lock after successful redirection');
        clearRedirectLock();
      }, clearTimeout);
    }
  }, [isLoading, user, session, userRole, location.pathname, isPasswordResetConfirmRoute, isDevelopment]);

  useEffect(() => {
    console.log('[AuthProvider] Initial auth check started');
    
    if (isPasswordResetConfirmRoute) {
      console.log('[AuthProvider] On reset password page - skipping initial loading');
      setLoadingWithTimeout(false, 'reset-page-detected');
      return;
    }

    setLoadingWithTimeout(true, 'initial-auth-check');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AuthProvider] Auth state changed:', event, newSession ? 'Has session' : 'No session');
      
      // CRITICAL FIX: Always update session and user state first
      setSession(newSession);
      setUser(newSession?.user || null);

      // CRITICAL: Check skip flags IMMEDIATELY after setting session/user
      const skipEmailVerification = hasAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
      const skipRedirectForFlow = shouldSkipRedirectForCurrentFlow();
      
      console.log('[AuthProvider] Auth state change - skip flags:', {
        skipEmailVerification,
        skipRedirectForFlow,
        hasRedirectLock: hasRedirectLock()
      });

      // EARLY RETURN: If email verification or other flows are active, ONLY update state
      if (skipEmailVerification || skipRedirectForFlow || hasRedirectLock()) {
        console.log('[AuthProvider] Auth state updated, but SKIPPING all redirect logic - verification or redirect lock active');
        return;
      }

      // Track password recovery state globally
      if (event === 'PASSWORD_RECOVERY') {
        console.log('[AuthProvider] Password recovery detected - preventing redirects');
        isPasswordRecoveryRef.current = true;
        return;
      }

      if (event === 'SIGNED_OUT') {
        console.log('[AuthProvider] Signed out - clearing recovery state');
        isPasswordRecoveryRef.current = false;
        passwordResetCompleteRef.current = false;
        setUserRole(null);
        setIsProfileComplete(false);
      }

      // Handle role detection for signed in users
      if (!isPasswordRecoveryRef.current && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        if (newSession?.user) {
          console.log('[AuthProvider] User signed in, detecting role...');
          
          // Force role detection with enhanced logic
          setTimeout(async () => {
            const detectedRole = await detectUserRole(newSession.user.id);
            if (detectedRole) {
              setUserRole(detectedRole);
              console.log('[AuthProvider] Role set to:', detectedRole);
            }
          }, 100);
          
          if (event === 'SIGNED_IN' && !isPasswordResetConfirmRoute && !passwordResetCompleteRef.current) {
            toast.success('You have successfully logged in!');
          }
        }
      }

      // Complete loading only if not on password reset page and not in recovery flow
      if (!isPasswordResetConfirmRoute && !isPasswordRecoveryRef.current) {
        setLoadingWithTimeout(false, `auth-state-${event.toLowerCase()}`);
        authInitializedRef.current = true;
      }
    });

    // Only run initial session check if not on the password reset page and not during specific flows
    if (!isPasswordResetConfirmRoute && !shouldSkipRedirectForCurrentFlow()) {
      supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
        setSession(initialSession);
        setUser(initialSession?.user || null);
        
        if (initialSession?.user) {
          // Enhanced role detection on initial load
          const detectedRole = await detectUserRole(initialSession.user.id);
          if (detectedRole) {
            setUserRole(detectedRole);
            console.log('[AuthProvider] Initial role set to:', detectedRole);
          }
        }
        
        setLoadingWithTimeout(false, 'initial-session-check');
        authInitializedRef.current = true;
      });
    }

    return () => {
      console.log('[AuthProvider] Cleaning up auth subscription');
      subscription.unsubscribe();
      clearLoadingTimeout();
    };
  }, [isPasswordResetConfirmRoute]);

  if (isLoading && !isPasswordResetConfirmRoute) {
    return <LoadingScreen message={`Loading your account... (${lastOperationRef.current})`} />;
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userRole, 
      signOut, 
      isLoading,
      requireAuth,
      clearLastAction,
      checkPendingUpvote,
      isProfileComplete
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
