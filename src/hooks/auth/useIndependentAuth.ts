
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseIndependentAuthOptions {
  redirectPath: string;
  returnPath: string;
  loadingMessage?: string;
  errorMessage?: string;
  requireAuthMessage?: string;
}

interface UseIndependentAuthReturn {
  user: User | null;
  isLoading: boolean;
  authChecked: boolean;
}

export const useIndependentAuth = (options: UseIndependentAuthOptions): UseIndependentAuthReturn => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const {
    redirectPath,
    returnPath,
    loadingMessage = "Verifying access...",
    errorMessage = "Authentication failed. Please sign in again.",
    requireAuthMessage = "Please sign in to access this page"
  } = options;

  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      try {
        console.log(`[IndependentAuth] Starting auth check for ${returnPath}...`);
        
        // Signal to AuthProvider to skip its redirection logic
        sessionStorage.setItem('skipPostLoginRedirection', 'true');
        
        // Get current session directly from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error(`[IndependentAuth] Auth error for ${returnPath}:`, error);
          throw error;
        }

        if (!session?.user) {
          console.log(`[IndependentAuth] No authenticated user found for ${returnPath}, redirecting...`);
          toast.error(requireAuthMessage);
          navigate(redirectPath, { 
            replace: true,
            state: { 
              returnPath,
              message: requireAuthMessage
            }
          });
          return;
        }

        console.log(`[IndependentAuth] User authenticated successfully for ${returnPath}:`, session.user.id);
        setUser(session.user);
        setAuthChecked(true);
        
      } catch (error: any) {
        console.error(`[IndependentAuth] Authentication check failed for ${returnPath}:`, error);
        toast.error(errorMessage);
        navigate(redirectPath, { replace: true });
      } finally {
        setIsLoading(false);
        // Clean up the skip flag after a short delay
        setTimeout(() => {
          sessionStorage.removeItem('skipPostLoginRedirection');
        }, 1000);
      }
    };

    checkAuthAndLoadUser();
  }, [navigate, redirectPath, returnPath, errorMessage, requireAuthMessage]);

  return {
    user,
    isLoading,
    authChecked
  };
};
