
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useAuthVerification = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const verifyAuth = async () => {
    if (!user || authLoading) return false;

    setIsVerifying(true);
    setVerificationError(null);

    try {
      console.log('[useAuthVerification] Starting verification for user:', user.id);

      // Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session || sessionError) {
        console.error('[useAuthVerification] Session check failed:', sessionError);
        setVerificationError('Session verification failed');
        return false;
      }

      // Test RLS with a simple query
      const { error: testError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .limit(1);

      if (testError) {
        console.error('[useAuthVerification] RLS test failed:', testError);
        
        if (testError.message.includes('auth.uid()')) {
          // Try to refresh session
          console.log('[useAuthVerification] Attempting session refresh');
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('[useAuthVerification] Session refresh failed:', refreshError);
            setVerificationError('Authentication refresh failed');
            return false;
          }

          // Retry the test query after refresh
          const { error: retryError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .limit(1);

          if (retryError) {
            console.error('[useAuthVerification] Retry after refresh failed:', retryError);
            setVerificationError('Authentication verification failed after refresh');
            return false;
          }
        } else {
          setVerificationError(testError.message);
          return false;
        }
      }

      console.log('[useAuthVerification] Verification successful');
      setIsVerified(true);
      return true;
    } catch (error: any) {
      console.error('[useAuthVerification] Verification error:', error);
      setVerificationError(error.message);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const retryVerification = () => {
    setIsVerified(false);
    verifyAuth();
  };

  const showAuthError = () => {
    if (verificationError) {
      toast.error(`Authentication issue: ${verificationError}. Try logging out and back in.`);
    }
  };

  useEffect(() => {
    if (user && !authLoading && !isVerified && !isVerifying) {
      verifyAuth();
    }
  }, [user, authLoading, isVerified, isVerifying]);

  return {
    isVerified,
    isVerifying,
    verificationError,
    retryVerification,
    showAuthError,
    needsAuth: !user || authLoading
  };
};
