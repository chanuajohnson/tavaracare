
import { useEffect, useState } from 'react';
import { LoadingState } from '@/components/auth/reset-password/LoadingState';
import { ErrorState } from '@/components/auth/reset-password/ErrorState';
import { PasswordResetForm } from '@/components/auth/reset-password/PasswordResetForm';
import { extractResetTokens } from '@/utils/authResetUtils';
import { supabase } from '@/integrations/supabase/client';
import { VALIDATION_TIMEOUT_MS } from '@/utils/passwordResetUtils';

const ResetPasswordConfirm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState<string | null>(null);

  useEffect(() => {
    const validateResetSession = async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session validation timed out')), VALIDATION_TIMEOUT_MS)
      );

      try {
        console.log('[Reset] Starting session validation on reset-password/confirm page');
        console.log('[Reset] URL:', window.location.href);
        
        // Prevent any automatic redirects while on this page
        sessionStorage.setItem('skipPostLoginRedirect', 'true');
        
        // Extract tokens from query parameters
        const { access_token, refresh_token, token, type, error } = extractResetTokens();
        
        if (error) {
          throw new Error(error);
        }

        // Race between session validation and timeout
        await Promise.race([
          (async () => {
            let sessionResult;
            
            // Handle different token formats
            if (access_token && refresh_token) {
              console.log('[Reset] Using Supabase access_token format');
              sessionResult = await supabase.auth.setSession({
                access_token: access_token,
                refresh_token: refresh_token
              });
            } 
            else if (token && type === 'recovery') {
              console.log('[Reset] Using legacy token format, exchanging for session');
              
              // For the legacy format, we need to determine the user's email first
              // This is a workaround since the Supabase API now requires an email for verifyOtp
              
              // We can try to extract email from the URL if available
              const searchParams = new URLSearchParams(window.location.search);
              const email = searchParams.get('email');
              
              if (!email) {
                console.error('[Reset] Email parameter is missing for recovery token verification');
                throw new Error('Invalid recovery link. The link must include an email parameter.');
              }
              
              // Now we have the email, we can verify the OTP
              sessionResult = await supabase.auth.verifyOtp({
                token: token,
                type: 'recovery',
                email: email
              });
              
              // Set the email address for the password reset form
              setEmailAddress(email);
            } 
            else {
              throw new Error('No valid token format found in URL');
            }

            if (sessionResult.error) {
              console.error('[Reset] Session error:', sessionResult.error);
              throw new Error(sessionResult.error.message);
            }
            
            // Validate the session
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
              throw new Error('No valid user found after token exchange');
            }
            
            console.log('[Reset] Successfully validated user session for:', user.email);
            // Only set email if not already set from the URL parameter
            if (!emailAddress) {
              setEmailAddress(user.email);
            }
            setValidSession(true);
            setValidationError(null);
          })(),
          timeoutPromise
        ]);
        
      } catch (error: any) {
        console.error('[Reset] Session validation error:', error);
        setValidationError(
          error.message === 'Session validation timed out'
            ? 'Connection timeout. Please try again or request a new reset link.'
            : error.message
        );
      } finally {
        setIsLoading(false);
      }
    };

    validateResetSession();
    
    return () => {
      // Clear the skip redirect flag when leaving this page
      sessionStorage.removeItem('skipPostLoginRedirect');
    };
  }, [emailAddress]);

  // Show loading state
  if (isLoading) {
    return <LoadingState message="Validating reset link..." />;
  }

  // Show error state
  if (validationError) {
    return <ErrorState error={validationError} />;
  }

  // Skip rendering form if session validation failed
  if (!validSession) {
    return null;
  }

  // Show password reset form
  return (
    <div className="container max-w-md mx-auto mt-16 flex items-center min-h-[55vh]">
      <PasswordResetForm emailAddress={emailAddress} />
    </div>
  );
};

export default ResetPasswordConfirm;
