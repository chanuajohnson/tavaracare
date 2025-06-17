
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
      setLoadingWithTimeout(false, 'sign-out-error');
      safeNavigate('/', { skipCheck: true });
      toast.success('You have been signed out successfully');
    }
  };

  // Handle post-login redirection only when appropriate
  useEffect(() => {
    // DEFENSIVE CHECK: Double-check skip flags before any redirect logic
    const skipEmailVerification = hasAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
    const skipRedirectForFlow = shouldSkipRedirectForCurrentFlow();
    
    console.log('[AuthProvider] Redirect check:', {
      isLoading,
      hasUser: !!user,
      isPasswordResetRoute: isPasswordResetConfirmRoute,
      isPasswordRecovery: isPasswordRecoveryRef.current,
      skipEmailVerification,
      skipRedirectForFlow,
      location: location.pathname
    });
    
    const shouldSkipRedirect = 
      isLoading || 
      !user || 
      isPasswordResetConfirmRoute || 
      isPasswordRecoveryRef.current ||
      skipRedirectForFlow;
    
    if (shouldSkipRedirect) {
      if (skipEmailVerification) {
        console.log('[AuthProvider] SKIPPING post-login redirect - email verification flag is active');
      } else if (skipRedirectForFlow) {
        console.log('[AuthProvider] SKIPPING post-login redirect due to other auth flow flags');
      }
      return;
    }
    
    console.log('[AuthProvider] User loaded. Handling redirection...');
    
    if (!initialRedirectionDoneRef.current || location.pathname === '/auth') {
      handlePostLoginRedirection();
      initialRedirectionDoneRef.current = true;
    }
  }, [isLoading, user, userRole, location.pathname, isPasswordResetConfirmRoute]);

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
      
      // DEFENSIVE CHECK: Log flag state during auth state changes
      const skipEmailVerification = hasAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
      console.log('[AuthProvider] Auth state change - skip email verification flag:', skipEmailVerification);
      
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

      // Don't process auth state changes when on the reset password page or during specific flows
      if (isPasswordResetConfirmRoute || shouldSkipRedirectForCurrentFlow()) {
        console.log('[AuthProvider] IGNORING auth state change - reset password page or auth flow flags active');
        return;
      }
      
      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (!isPasswordRecoveryRef.current && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        if (newSession?.user) {
          if (newSession.user.user_metadata?.role) {
            setUserRole(newSession.user.user_metadata.role);
          }
          
          if (event === 'SIGNED_IN' && !isPasswordResetConfirmRoute && !passwordResetCompleteRef.current) {
            // DEFENSIVE CHECK: Only show toast if not during email verification
            if (!skipEmailVerification) {
              toast.success('You have successfully logged in!');
            }
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
