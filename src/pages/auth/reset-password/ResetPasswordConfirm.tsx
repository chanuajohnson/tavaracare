
import { useEffect, useState } from 'react';
import { LoadingState } from '@/components/auth/reset-password/LoadingState';
import { ErrorState } from '@/components/auth/reset-password/ErrorState';
import { PasswordResetForm } from '@/components/auth/reset-password/PasswordResetForm';
import { extractResetTokens } from '@/utils/authResetUtils';
import { supabase } from '@/integrations/supabase/client';

const ResetPasswordConfirm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState<string | null>(null);

  useEffect(() => {
    async function validateResetSession() {
      try {
        console.log('[Reset] Starting session validation...');
        
        // Prevent any automatic redirects while on this page
        sessionStorage.setItem('skipPostLoginRedirect', 'true');
        
        // Extract tokens from query parameters
        const { access_token, refresh_token, type, error } = extractResetTokens();
        
        if (error) {
          throw new Error(error);
        }

        // Set up session with the tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: access_token || '',
          refresh_token: refresh_token || ''
        });

        if (sessionError) {
          console.error('[Reset] Session error:', sessionError);
          throw new Error(sessionError.message);
        }
        
        // Validate the session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No valid user found after token exchange');
        }
        
        // Store the email address for display
        setEmailAddress(user.email);
        setValidSession(true);
        setValidationError(null);
        
        console.log('[Reset] Valid recovery session detected:', {
          email: user.email,
          type
        });
        
      } catch (error: any) {
        console.error('[Reset] Session validation error:', error);
        setValidationError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    validateResetSession();
    
    return () => {
      // Clear the skip redirect flag when leaving this page
      sessionStorage.removeItem('skipPostLoginRedirect');
    };
  }, []);

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
