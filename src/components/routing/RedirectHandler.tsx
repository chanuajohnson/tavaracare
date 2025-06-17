
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ensureUserProfile } from '@/lib/profile-utils';
import { UserRole } from '@/types/database';
import { toast } from 'sonner';
import { setAuthFlowFlag, clearAuthFlowFlag, AUTH_FLOW_FLAGS } from '@/utils/authFlowUtils';

const REDIRECT_TIMEOUT = 10000; // Increased to 10 seconds for email verification
const VALID_ROUTES = [
  '/', '/auth', '/features', '/about', '/faq',
  '/registration/family', '/registration/professional', '/registration/community',
  '/dashboard/family', '/dashboard/professional', '/dashboard/community', '/dashboard/admin',
  '/family', '/professional', '/community', '/subscription'
];

export function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    console.log('[RedirectHandler] Checking for redirects', { 
      pathname: location.pathname, 
      search: location.search,
      hash: location.hash,
      hostname: window.location.hostname,
      isLovablePreview: window.location.hostname.includes('lovable.app')
    });
    
    // Check if this is an asset request - don't process assets
    const assetExtensions = /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf|map|json|xml|txt|pdf|zip|mp4|mp3|wav)$/i;
    if (assetExtensions.test(location.pathname)) {
      console.log('[RedirectHandler] Asset request detected, skipping redirect handling');
      return;
    }
    
    // Check for asset directory requests
    if (location.pathname.includes('/assets/') || location.pathname.startsWith('/static/')) {
      console.log('[RedirectHandler] Asset directory request detected, skipping redirect handling');
      return;
    }
    
    // Only process if we have something to redirect
    const hasRedirectData = location.hash || 
                           location.search.includes('route=') || 
                           location.hash.includes('access_token=') ||
                           location.search.includes('access_token=') ||
                           location.search.includes('token_hash=') ||
                           location.search.includes('type=signup');
    
    if (!hasRedirectData) {
      console.log('[RedirectHandler] No redirect data found, skipping processing');
      return;
    }
    
    // Set processing state
    setIsProcessing(true);
    
    // Set up timeout fallback
    const timeoutId = setTimeout(() => {
      console.warn('[RedirectHandler] Redirect timeout - checking if session was established');
      setIsProcessing(false);
      
      // Check if a session was established during the timeout
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          console.log('[RedirectHandler] Session found after timeout, attempting role-based redirect');
          handleSuccessfulEmailVerification(session.user);
        } else {
          console.warn('[RedirectHandler] No session found, redirecting to home');
          clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
          if (location.pathname !== '/') {
            navigate('/', { replace: true });
          }
        }
      });
    }, REDIRECT_TIMEOUT);
    
    try {
      processRedirects(timeoutId);
    } catch (error) {
      console.error('[RedirectHandler] Error processing redirects:', error);
      clearTimeout(timeoutId);
      setIsProcessing(false);
      clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const processRedirects = async (timeoutId: NodeJS.Timeout) => {
    try {
      // Handle legacy query parameter redirects (from old 404.html)
      const params = new URLSearchParams(location.search);
      const routeParam = params.get('route');
      
      if (routeParam) {
        const targetRoute = '/' + routeParam;
        console.log(`[RedirectHandler] Legacy query redirect to: ${targetRoute}`);
        
        if (isValidRoute(targetRoute)) {
          clearTimeout(timeoutId);
          setIsProcessing(false);
          navigate(targetRoute, { replace: true });
          return;
        } else {
          console.warn(`[RedirectHandler] Invalid route: ${targetRoute}, redirecting to home`);
          clearTimeout(timeoutId);
          setIsProcessing(false);
          navigate('/', { replace: true });
          return;
        }
      }
      
      // Handle hash-based redirects (new approach from updated 404.html)
      if (location.hash && location.hash.startsWith('#/')) {
        const hashPath = location.hash.substring(1); // Remove the #
        const [path, queryString] = hashPath.split('?');
        
        console.log(`[RedirectHandler] Hash-based redirect detected: ${path}${queryString ? '?' + queryString : ''}`);
        
        if (isValidRoute(path)) {
          clearTimeout(timeoutId);
          setIsProcessing(false);
          
          // Handle auth routes with special care
          if (path.includes('/auth/reset-password/confirm')) {
            await handleEmailConfirmation(queryString);
          } else {
            // Navigate to the path with query parameters if present
            const fullPath = queryString ? `${path}?${queryString}` : path;
            console.log(`[RedirectHandler] Navigating to: ${fullPath}`);
            navigate(fullPath, { replace: true });
          }
          return;
        } else {
          console.warn(`[RedirectHandler] Invalid hash route: ${path}, redirecting to home`);
          clearTimeout(timeoutId);
          setIsProcessing(false);
          navigate('/', { replace: true });
          return;
        }
      }

      // Handle email confirmation with authentication tokens (hash format)
      if (location.hash && location.hash.includes('access_token=')) {
        console.log('[RedirectHandler] Email confirmation tokens detected in hash');
        await handleEmailConfirmation();
        clearTimeout(timeoutId);
        setIsProcessing(false);
        return;
      }

      // Handle email confirmation tokens in search params (most common for signup verification)
      if (location.search && (location.search.includes('access_token=') || location.search.includes('token_hash='))) {
        console.log('[RedirectHandler] Email confirmation tokens detected in search params');
        await handleEmailConfirmation(location.search.substring(1));
        clearTimeout(timeoutId);
        setIsProcessing(false);
        return;
      }

      // If no special redirects needed, clear processing
      clearTimeout(timeoutId);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('[RedirectHandler] Error in processRedirects:', error);
      clearTimeout(timeoutId);
      setIsProcessing(false);
      clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
      navigate('/', { replace: true });
    }
  };

  const isValidRoute = (route: string): boolean => {
    // Check exact matches first
    if (VALID_ROUTES.includes(route)) {
      return true;
    }
    
    const dynamicRoutes = [
      /^\/family\/.*$/,
      /^\/professional\/.*$/,
      /^\/community\/.*$/,
      /^\/admin\/.*$/,
      /^\/auth\/.*$/,
      /^\/subscription\/.*$/,
      /^\/caregiver\/.*$/,
      /^\/legacy\/.*$/,
      /^\/debug\/.*$/
    ];
    
    return dynamicRoutes.some(pattern => pattern.test(route));
  };

  const handleEmailConfirmation = async (queryString?: string) => {
    try {
      console.log('[RedirectHandler] Processing email confirmation');
      
      // Set flag to prevent AuthProvider from interfering with email verification redirect
      setAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
      
      // Extract tokens from hash or query string
      let params: URLSearchParams;
      
      if (queryString) {
        params = new URLSearchParams(queryString);
      } else {
        // Parse the hash - remove the # and parse the fragment
        const hashFragment = location.hash.substring(1);
        console.log('[RedirectHandler] Hash fragment:', hashFragment);
        params = new URLSearchParams(hashFragment);
      }
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      const tokenHash = params.get('token_hash');

      console.log('[RedirectHandler] Email confirmation params:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        hasTokenHash: !!tokenHash,
        type,
        fullHash: location.hash
      });

      // Handle different token types
      if (tokenHash && type) {
        console.log('[RedirectHandler] Processing token hash verification');
        
        // Use verifyOtp for token hash verification
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any
        });

        if (error) {
          console.error('[RedirectHandler] Error verifying token hash:', error);
          toast.error('Email verification failed. Please try signing up again.');
          clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
          window.history.replaceState({}, '', window.location.pathname);
          navigate('/auth', { replace: true });
          return;
        }

        if (data.user) {
          console.log('[RedirectHandler] Token hash verification successful for user:', data.user.id);
          await handleSuccessfulEmailVerification(data.user);
          return;
        }
      }

      if (accessToken && refreshToken) {
        console.log('[RedirectHandler] Processing access token verification');
        
        // Set the session with the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('[RedirectHandler] Error setting session:', error);
          toast.error('Email verification failed. Please try signing up again.');
          clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
          window.history.replaceState({}, '', window.location.pathname);
          navigate('/auth', { replace: true });
          return;
        }

        if (data.user) {
          console.log('[RedirectHandler] Session established for user:', data.user.id, 'with metadata:', data.user.user_metadata);
          await handleSuccessfulEmailVerification(data.user);
          return;
        }
      }

      console.warn('[RedirectHandler] Missing or invalid tokens in email confirmation');
      toast.error('Email verification failed. Please try signing up again.');
      clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
      navigate('/auth', { replace: true });
      
    } catch (error) {
      console.error('[RedirectHandler] Error in handleEmailConfirmation:', error);
      toast.error('Email verification failed. Please try signing up again.');
      clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
      window.history.replaceState({}, '', window.location.pathname);
      navigate('/auth', { replace: true });
    }
  };

  const handleSuccessfulEmailVerification = async (user: any) => {
    try {
      console.log('[RedirectHandler] Starting handleSuccessfulEmailVerification for user:', user.id);
      
      // Clear the hash from URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Get user role from multiple sources with fallbacks
      let userRole: UserRole | null = null;
      
      // First, try user metadata
      if (user.user_metadata?.role) {
        userRole = user.user_metadata.role as UserRole;
        console.log('[RedirectHandler] Role found in user metadata:', userRole);
      }
      
      // Fallback to localStorage registration intent
      if (!userRole) {
        const storedRole = localStorage.getItem('registeringAs') || localStorage.getItem('registrationRole');
        if (storedRole) {
          userRole = storedRole as UserRole;
          console.log('[RedirectHandler] Role found in localStorage:', userRole);
        }
      }
      
      // Ensure user profile exists with the determined role
      if (userRole) {
        console.log('[RedirectHandler] Ensuring user profile exists with role:', userRole);
        await ensureUserProfile(user.id, userRole);
        
        // Clean up localStorage
        localStorage.removeItem('registeringAs');
        localStorage.removeItem('registrationRole');
        
        // Determine target dashboard
        const dashboardRoutes: Record<UserRole, string> = {
          'family': '/dashboard/family',
          'professional': '/dashboard/professional',
          'community': '/dashboard/community',
          'admin': '/dashboard/admin'
        };
        
        const targetDashboard = dashboardRoutes[userRole];
        
        if (targetDashboard) {
          console.log('[RedirectHandler] Email verification complete, redirecting to dashboard:', targetDashboard);
          toast.success(`Welcome! Your ${userRole} account has been verified successfully.`);
          
          // Navigate to dashboard first
          navigate(targetDashboard, { replace: true });
          
          // Clear the flag after navigation to allow normal AuthProvider behavior
          setTimeout(() => {
            clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
            console.log('[RedirectHandler] Cleared email verification redirect flag after successful navigation');
          }, 100);
          
          return;
        }
      }
      
      // Fallback if no role could be determined
      console.warn('[RedirectHandler] No role detected after email verification, redirecting to home');
      toast.success('Email verified successfully! Please complete your profile.');
      
      // Clear flag and redirect to home
      clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('[RedirectHandler] Error in handleSuccessfulEmailVerification:', error);
      toast.error('Email verification completed, but there was an issue. Please try logging in.');
      clearAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_EMAIL_VERIFICATION_REDIRECT);
      navigate('/auth', { replace: true });
    }
  };
  
  // Don't render anything during processing to avoid flicker
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Processing email verification...</p>
          <p className="text-xs text-gray-400 mt-2">This may take a few moments...</p>
        </div>
      </div>
    );
  }
  
  return null;
}
