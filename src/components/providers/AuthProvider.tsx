
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
    console.log('[App] Route changed to:', location.pathname);
    
    // Check if we're on the reset password page
    if (isPasswordResetConfirmRoute) {
      console.log('[AuthProvider] On password reset page - skipping initial loading state');
      isPasswordRecoveryRef.current = true;
    }
    
    // Check if password reset was completed
    if (sessionStorage.getItem('passwordResetComplete')) {
      console.log('[AuthProvider] Password reset was completed');
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

  useEffect(() => {
    if (isLoading || !user || 
        isPasswordResetConfirmRoute || 
        sessionStorage.getItem('skipPostLoginRedirect') ||
        isPasswordRecoveryRef.current) {
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
      console.log('[AuthProvider] On password reset page - skipping initial loading state');
      setLoadingWithTimeout(false, 'reset-page-detected');
      return;
    }

    setLoadingWithTimeout(true, 'initial-auth-check');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AuthProvider] Auth state changed:', event, newSession ? 'Has session' : 'No session');
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('[AuthProvider] Password recovery detected - preventing redirects');
        isPasswordRecoveryRef.current = true;
        return; // Don't process further for PASSWORD_RECOVERY events
      }

      if (event === 'SIGNED_OUT') {
        console.log('[AuthProvider] Signed out - clearing password recovery state');
        isPasswordRecoveryRef.current = false;
        passwordResetCompleteRef.current = false;
      }

      if (isPasswordResetConfirmRoute && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('[AuthProvider] Ignoring auth state change on reset password page');
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
            toast.success('You have successfully logged in!');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setIsProfileComplete(false);
      }

      if (!isPasswordResetConfirmRoute && !isPasswordRecoveryRef.current) {
        setLoadingWithTimeout(false, `auth-state-${event.toLowerCase()}`);
        authInitializedRef.current = true;
      }
    });

    if (!isPasswordResetConfirmRoute) {
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
