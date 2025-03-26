import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getUserRole } from '@/lib/supabase';
import { UserRole } from '@/types/database';
import { toast } from 'sonner';
import LoadingScreen from '../common/LoadingScreen';

const LOADING_TIMEOUT_MS = 15000;
const MAX_RETRY_ATTEMPTS = 3;

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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const isRedirectingRef = useRef(false);
  const isSigningOutRef = useRef(false);
  const retryAttemptsRef = useRef<Record<string, number>>({});
  const navigationInProgressRef = useRef(false);
  const lastPathRef = useRef<string | null>(null);
  const initialRedirectionDoneRef = useRef(false);

  useEffect(() => {
    console.log('[AuthProvider] Auth State:', { 
      isLoading, 
      userRole, 
      isProfileComplete, 
      user: user ? 'Authenticated' : null 
    });
    
    if (isLoading) {
      console.log('[AuthProvider] Waiting for authentication to load...');
    }
  }, [isLoading, userRole, isProfileComplete, user]);

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      console.log(`[AuthProvider] Clearing loading timeout`);
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const setLoadingWithTimeout = (loading: boolean, operation: string) => {
    console.log(`[AuthProvider] ${loading ? 'START' : 'END'} loading state for: ${operation}`);
    
    clearLoadingTimeout();
    
    setIsLoading(loading);
    
    if (loading) {
      console.log(`[AuthProvider] Setting loading timeout for: ${operation} (${LOADING_TIMEOUT_MS}ms)`);
      loadingTimeoutRef.current = setTimeout(() => {
        console.log(`[AuthProvider] TIMEOUT reached for: ${operation} - forcibly ending loading state`);
        setIsLoading(false);
        
        const isAuthOperation = operation.includes('sign-out') || 
                               operation.includes('fetch-session') || 
                               operation.includes('auth-state-change');
        
        if (isAuthOperation) {
          console.log('[AuthProvider] Authentication operation timed out - recovering gracefully');
          
          if (session && user) {
            console.log('[AuthProvider] Session exists but role determination failed');
            toast.error(`Authentication operation timed out. Please refresh the page and try again.`);
            
            try {
              localStorage.setItem('lastAuthState', JSON.stringify({
                userId: user.id,
                email: user.email,
                timeoutOperation: operation,
                timestamp: new Date().toISOString()
              }));
            } catch (err) {
              console.error('[AuthProvider] Error saving auth state for recovery:', err);
            }
          } else if (isSigningOutRef.current) {
            console.log('[AuthProvider] Sign out timed out - forcing state reset');
            setSession(null);
            setUser(null);
            setUserRole(null);
            
            isSigningOutRef.current = false;
            navigate('/');
            toast.success('You have been signed out successfully');
            
            supabase.auth.signOut().catch(err => console.error('[AuthProvider] Error during forced signout:', err));
          } else {
            console.log('[AuthProvider] Authentication flow interrupted - resetting state');
            toast.error(`Authentication operation timed out. Please try again.`);
          }
          
          localStorage.setItem('authTimeoutRecovery', 'true');
        }
      }, LOADING_TIMEOUT_MS);
    }
  };

  const retryOperation = async <T,>(
    operation: string, 
    fn: () => Promise<T>, 
    maxRetries: number = MAX_RETRY_ATTEMPTS
  ): Promise<T | null> => {
    retryAttemptsRef.current[operation] = 0;
    
    while (retryAttemptsRef.current[operation] < maxRetries) {
      try {
        const result = await fn();
        delete retryAttemptsRef.current[operation];
        return result;
      } catch (error) {
        retryAttemptsRef.current[operation]++;
        console.error(`[AuthProvider] Error in ${operation} (attempt ${retryAttemptsRef.current[operation]}/${maxRetries}):`, error);
        
        if (retryAttemptsRef.current[operation] < maxRetries) {
          const delay = Math.min(1000 * retryAttemptsRef.current[operation], 3000);
          console.log(`[AuthProvider] Retrying ${operation} in ${delay}ms (attempt ${retryAttemptsRef.current[operation] + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`[AuthProvider] Operation ${operation} failed after ${maxRetries} attempts`);
    delete retryAttemptsRef.current[operation];
    return null;
  };

  const checkProfileCompletion = async (userId: string) => {
    try {
      console.log('[AuthProvider] Checking profile completion for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role, professional_type, first_name, last_name')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('[AuthProvider] Error checking profile completion:', error);
        throw error;
      }
      
      console.log('[AuthProvider] Profile data retrieved:', profile);
      
      if (profile?.role && !userRole) {
        console.log('[AuthProvider] Setting user role from profile:', profile.role);
        setUserRole(profile.role);
      }
      
      let profileComplete = false;
      
      if (profile) {
        if (profile.role === 'professional') {
          profileComplete = !!(profile.full_name || (profile.first_name && profile.last_name)) && 
                           !!profile.professional_type;
        } else {
          profileComplete = !!(profile.full_name || (profile.first_name && profile.last_name));
        }
      }
      
      console.log('[AuthProvider] Profile complete:', profileComplete);
      setIsProfileComplete(profileComplete);
      return profileComplete;
    } catch (error) {
      console.error('[AuthProvider] Error checking profile completion:', error);
      return false;
    }
  };

  const checkPendingUpvote = async () => {
    const pendingFeatureId = localStorage.getItem('pendingFeatureId') || localStorage.getItem('pendingFeatureUpvote');
    
    if (pendingFeatureId && user) {
      try {
        console.log(`[AuthProvider] Processing pending upvote for feature: ${pendingFeatureId}`);
        
        const { data: existingVote, error: checkError } = await supabase
          .from('feature_upvotes')
          .select('id')
          .eq('feature_id', pendingFeatureId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (checkError) {
          console.error('[AuthProvider] Error checking existing vote:', checkError);
          throw checkError;
        }
        
        if (!existingVote) {
          const { error: voteError } = await supabase
            .from('feature_upvotes')
            .insert([{
              feature_id: pendingFeatureId,
              user_id: user.id
            }]);
          
          if (voteError) {
            console.error('[AuthProvider] Error recording vote:', voteError);
            throw voteError;
          }
          
          toast.success('Your vote has been recorded!');
        } else {
          toast.info('You have already voted for this feature');
        }
        
        localStorage.removeItem('pendingFeatureId');
        localStorage.removeItem('pendingFeatureUpvote');
        
        navigate('/dashboard/family');
      } catch (error: any) {
        console.error('[AuthProvider] Error handling pending upvote:', error);
        toast.error(error.message || 'Failed to process your vote');
      }
    }
  };

  const safeNavigate = (path: string, options: { 
    replace?: boolean, 
    skipCheck?: boolean,
    state?: Record<string, any>
  } = {}) => {
    if (navigationInProgressRef.current && !options.skipCheck) {
      console.log(`[AuthProvider] Navigation already in progress, skipping navigation to: ${path}`);
      return;
    }
    
    if (location.pathname === path && !options.skipCheck) {
      console.log(`[AuthProvider] Already at path: ${path}, skipping navigation`);
      return;
    }
    
    lastPathRef.current = path;
    
    navigationInProgressRef.current = true;
    console.log(`[AuthProvider] Navigating to: ${path}`);
    
    if (options.replace) {
      navigate(path, { replace: true, state: options.state });
    } else {
      navigate(path, { state: options.state });
    }
    
    setTimeout(() => {
      navigationInProgressRef.current = false;
    }, 500);
  };

  const handlePostLoginRedirection = async () => {
    if (!user || isRedirectingRef.current) return;
    
    isRedirectingRef.current = true;
    
    try {
      console.log('[AuthProvider] Handling post-login redirection for user:', user.id);
      console.log('[AuthProvider] Current user role:', userRole);
      console.log('[AuthProvider] Current path:', location.pathname);
      
      let effectiveRole = userRole;
      if (!effectiveRole && user.user_metadata?.role) {
        console.log('[AuthProvider] Setting user role from metadata:', user.user_metadata.role);
        effectiveRole = user.user_metadata.role;
        setUserRole(user.user_metadata.role);
      }
      
      const profileComplete = await checkProfileCompletion(user.id);
      console.log('[AuthProvider] Profile complete:', profileComplete);
      
      const locationState = location.state as { returnPath?: string; action?: string } | null;
      
      if (locationState?.returnPath === "/family/story" && locationState?.action === "tellStory") {
        console.log('[AuthProvider] Redirecting to Tell Their Story page from location state');
        safeNavigate('/family/story', { skipCheck: true });
        isRedirectingRef.current = false;
        return;
      }
      
      if (profileComplete && location.pathname.includes('/registration/')) {
        console.log('[AuthProvider] Profile is complete and user is on registration page, redirecting to dashboard');
        const dashboardPath = effectiveRole ? `/dashboard/${effectiveRole.toLowerCase()}` : '/';
        safeNavigate(dashboardPath, { skipCheck: true });
        toast.success(`Profile completed successfully! Welcome to your dashboard.`);
        isRedirectingRef.current = false;
        return;
      }
      
      if (!profileComplete) {
        let registrationPath = '/registration/family';
        
        if (effectiveRole) {
          registrationPath = `/registration/${effectiveRole.toLowerCase()}`;
        } else if (localStorage.getItem('registrationRole')) {
          const intendedRole = localStorage.getItem('registrationRole');
          registrationPath = `/registration/${intendedRole?.toLowerCase()}`;
        }
        
        console.log('[AuthProvider] Redirecting to registration page:', registrationPath);
        toast.info('Please complete your profile to continue');
        safeNavigate(registrationPath, { skipCheck: true });
        isRedirectingRef.current = false;
        return;
      }
      
      const pendingFeatureId = localStorage.getItem('pendingFeatureId') || localStorage.getItem('pendingFeatureUpvote');
      if (pendingFeatureId) {
        await checkPendingUpvote();
        isRedirectingRef.current = false;
        return;
      }
      
      const pendingBooking = localStorage.getItem('pendingBooking');
      if (pendingBooking) {
        localStorage.removeItem('pendingBooking');
        safeNavigate(pendingBooking, { skipCheck: true });
        isRedirectingRef.current = false;
        return;
      }
      
      const pendingMessage = localStorage.getItem('pendingMessage');
      if (pendingMessage) {
        localStorage.removeItem('pendingMessage');
        safeNavigate(pendingMessage, { skipCheck: true });
        isRedirectingRef.current = false;
        return;
      }
      
      const pendingProfileUpdate = localStorage.getItem('pendingProfileUpdate');
      if (pendingProfileUpdate) {
        localStorage.removeItem('pendingProfileUpdate');
        safeNavigate(pendingProfileUpdate, { skipCheck: true });
        isRedirectingRef.current = false;
        return;
      }
      
      if (effectiveRole) {
        const dashboardRoutes: Record<UserRole, string> = {
          'family': '/dashboard/family',
          'professional': '/dashboard/professional',
          'community': '/dashboard/community',
          'admin': '/dashboard/admin'
        };
        
        initialRedirectionDoneRef.current = true;
        
        console.log('[AuthProvider] Redirecting to dashboard for role:', effectiveRole);
        safeNavigate(dashboardRoutes[effectiveRole], { skipCheck: true });
        toast.success(`Welcome to your ${effectiveRole} dashboard!`);
        clearLastAction();
      } else {
        console.log('[AuthProvider] No role detected, redirecting to home');
        safeNavigate('/', { skipCheck: true });
      }
    } catch (error) {
      console.error('[AuthProvider] Error during post-login redirection:', error);
    } finally {
      isRedirectingRef.current = false;
    }
  };

  const requireAuth = (action: string, redirectPath?: string) => {
    if (user) return true;

    localStorage.setItem('lastAction', action);
    localStorage.setItem('lastPath', redirectPath || location.pathname + location.search);
    
    if (action.startsWith('upvote "')) {
      const featureId = localStorage.getItem('pendingFeatureId');
      if (featureId) {
        localStorage.setItem('pendingFeatureUpvote', featureId);
      }
    } else if (action.startsWith('book care')) {
      localStorage.setItem('pendingBooking', redirectPath || location.pathname);
    } else if (action.startsWith('send message')) {
      localStorage.setItem('pendingMessage', redirectPath || location.pathname);
    } else if (action.startsWith('update profile')) {
      localStorage.setItem('pendingProfileUpdate', redirectPath || location.pathname);
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
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('pendingMessage');
    localStorage.removeItem('pendingProfileUpdate');
  };

  const fetchSessionAndUser = async () => {
    console.log("[AuthProvider] Fetching session and user...");
    setLoadingWithTimeout(true, 'fetch-session');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[AuthProvider] Error fetching session:", error);
        toast.error("Unable to load your session. Please try again.");
        setLoadingWithTimeout(false, 'fetch-session-error');
        return;
      }
      
      console.log("[AuthProvider] Session retrieved:", session ? "Has session" : "No session");

      if (!session) {
        console.log("[AuthProvider] No user in session");
        setSession(null);
        setUser(null);
        setUserRole(null);
        setIsProfileComplete(false);
        console.log("[AuthProvider] Session fetch complete, setting isLoading to false");
        setLoadingWithTimeout(false, 'fetch-session-complete');
        return;
      }

      setSession(session);
      setUser(session.user);

      if (session.user.user_metadata?.role) {
        console.log("[AuthProvider] Setting role from user metadata:", session.user.user_metadata.role);
        setUserRole(session.user.user_metadata.role);
      } else {
        console.log("[AuthProvider] Fetching user role from database...");
        const role = await getUserRole();
        console.log("[AuthProvider] Retrieved Role:", role);
        setUserRole(role);
      }
      
      await checkProfileCompletion(session.user.id);
      setLoadingWithTimeout(false, 'fetch-session-complete');
    } catch (error) {
      console.error("[AuthProvider] Error in fetchSessionAndUser:", error);
      toast.error("An error occurred while loading your account. Please try again.");
      setLoadingWithTimeout(false, 'fetch-session-error');
    }
  };

  useEffect(() => {
    if (isLoading || !user) return; // Wait until auth is loaded and we have a user
    
    console.log('[AuthProvider] User loaded. Handling redirection...');
    
    if (location.pathname.includes('/registration/') && isProfileComplete) {
      console.log('[AuthProvider] User has completed profile but is still on registration page');
      const dashboardPath = userRole ? `/dashboard/${userRole.toLowerCase()}` : '/';
      safeNavigate(dashboardPath, { skipCheck: true });
      toast.success(`Welcome to your dashboard!`);
      return;
    }
    
    if (!initialRedirectionDoneRef.current || location.pathname === '/auth') {
      handlePostLoginRedirection();
    }
  }, [isLoading, user, userRole, isProfileComplete, location.pathname]);

  useEffect(() => {
    const clearStaleState = async () => {
      const hadAuthError = localStorage.getItem('authStateError');
      if (hadAuthError) {
        console.log('[AuthProvider] Detected previous auth error, clearing state');
        localStorage.removeItem('authStateError');
        
        try {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setUserRole(null);
          setIsProfileComplete(false);
        } catch (e) {
          console.error('[AuthProvider] Error clearing stale auth state:', e);
        }
      }
    };
    
    clearStaleState();
    
    return () => {
      clearLoadingTimeout();
    };
  }, []);

  useEffect(() => {
    console.log('[AuthProvider] Initial auth check started');
    fetchSessionAndUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AuthProvider] Auth state changed:', event, newSession ? 'Has session' : 'No session');
      
      try {
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('[AuthProvider] User signed in or token refreshed');
          setLoadingWithTimeout(true, `auth-state-change-${event}`);
          
          if (newSession?.user) {
            console.log('[AuthProvider] Getting role for signed in user...');
            
            if (newSession.user.user_metadata?.role) {
              console.log('[AuthProvider] Setting role from user metadata:', newSession.user.user_metadata.role);
              setUserRole(newSession.user.user_metadata.role);
            } else {
              const role = await retryOperation(
                'get-user-role',
                async () => await getUserRole(),
                3
              );
              
              console.log('[AuthProvider] User role after retries:', role);
              setUserRole(role);
            }
            
            if (event === 'SIGNED_IN') {
              console.log('[AuthProvider] Processing post-signin actions');
              toast.success('You have successfully logged in!');
              
              if (location.pathname === '/auth' && localStorage.getItem('registeringAs')) {
                const registeringAs = localStorage.getItem('registeringAs');
                console.log(`[AuthProvider] User registering as: ${registeringAs}`);
                localStorage.setItem('registrationRole', registeringAs);
              }
            }
          }
          
          setLoadingWithTimeout(false, `auth-state-change-complete-${event}`);
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthProvider] User signed out');
          setLoadingWithTimeout(false, 'auth-state-change-SIGNED_OUT');
          setUserRole(null);
          setIsProfileComplete(false);
          
          localStorage.removeItem('authStateError');
          localStorage.removeItem('authTimeoutRecovery');
          localStorage.removeItem('registrationRole');
          localStorage.removeItem('registeringAs');
          
          if (isSigningOutRef.current) {
            isSigningOutRef.current = false;
            toast.success('You have been signed out successfully');
            safeNavigate('/', { skipCheck: true });
          }
        } else if (event === 'USER_UPDATED') {
          console.log('[AuthProvider] User updated');
          if (newSession?.user) {
            if (newSession.user.user_metadata?.role) {
              console.log('[AuthProvider] Setting role from updated user metadata:', newSession.user.user_metadata.role);
              setUserRole(newSession.user.user_metadata.role);
            } else {
              const role = await getUserRole();
              console.log('[AuthProvider] Updated user role:', role);
              setUserRole(role);
            }
          }
          
          setLoadingWithTimeout(false, `auth-state-change-complete-${event}`);
        } else {
          setLoadingWithTimeout(false, `auth-state-change-complete-${event}`);
        }
      } catch (error) {
        console.error('[AuthProvider] Error handling auth state change:', error);
        localStorage.setItem('authStateError', 'true');
        setLoadingWithTimeout(false, `auth-state-change-error-${event}`);
      }
    });

    return () => {
      console.log('[AuthProvider] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      console.log('[AuthProvider] Signing out...');
      isSigningOutRef.current = true;
      setLoadingWithTimeout(true, 'sign-out');
      
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsProfileComplete(false);
      
      localStorage.removeItem('authStateError');
      localStorage.removeItem('authTimeoutRecovery');
      localStorage.removeItem('registrationRole');
      localStorage.removeItem('registeringAs');
      localStorage.removeItem('lastAuthState');
      localStorage.removeItem('lastAction');
      localStorage.removeItem('lastPath');
      
      try {
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) {
          console.error('[AuthProvider] Supabase sign out error:', error);
          
          if (error.message && 
              (error.message.includes('Auth session missing') || 
               error.message.includes('JWT expired'))) {
            console.log('[AuthProvider] Ignoring expected auth session error during sign out');
          } else {
            throw error;
          }
        }
      } catch (supabaseError) {
        console.error('[AuthProvider] Exception during Supabase signOut:', supabaseError);
      }
      
      safeNavigate('/', { skipCheck: true, replace: true });
      toast.success('You have been signed out successfully');
      
      setLoadingWithTimeout(false, 'sign-out-complete');
      isSigningOutRef.current = false;
    } catch (error) {
      console.error('[AuthProvider] Error in signOut outer try/catch:', error);
      
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsLoading(false);
      isSigningOutRef.current = false;
      
      localStorage.setItem('authStateError', 'true');
      safeNavigate('/', { skipCheck: true });
      toast.success('You have been signed out successfully');
    }
  };

  console.log('[AuthProvider] Render state:', { 
    hasSession: !!session, 
    hasUser: !!user, 
    userRole, 
    isLoading,
    isProfileComplete
  });

  if (isLoading) {
    return <LoadingScreen message="Loading your account..." />;
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
