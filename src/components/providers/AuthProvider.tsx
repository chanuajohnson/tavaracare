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
import { shouldSkipRedirectForCurrentFlow, AUTH_FLOW_FLAGS, hasAuthFlowFlag } from '@/utils/authFlowUtils';

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
      setLoadingWithTimeout(false, 'sign-out-error');
      safeNavigate('/', { skipCheck: true });
      toast.success('You have been signed out successfully');
    }
  };

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
      
      handlePostLoginRedirection();
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
      }

      // Only proceed with role/toast logic if NOT during special flows
      if (!isPasswordRecoveryRef.current && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        if (newSession?.user) {
          if (newSession.user.user_metadata?.role) {
            setUserRole(newSession.user.user_metadata.role);
          }
          
          if (event === 'SIGNED_IN' && !isPasswordResetConfirmRoute && !passwordResetCompleteRef.current) {
            toast.success('You have successfully logged in!');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setIsProfileComplete(false);
      }

      // Complete loading only if not on password reset page and not in recovery flow
      if (!isPasswordResetConfirmRoute && !isPasswordRecoveryRef.current) {
        setLoadingWithTimeout(false, `auth-state-${event.toLowerCase()}`);
        authInitializedRef.current = true;
      }
    });

    // Only run initial session check if not on the password reset page and not during specific flows
    if (!isPasswordResetConfirmRoute && !shouldSkipRedirectForCurrentFlow()) {
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        setUser(initialSession?.user || null);
        if (initialSession?.user?.user_metadata?.role) {
          setUserRole(initialSession.user.user_metadata.role);
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
