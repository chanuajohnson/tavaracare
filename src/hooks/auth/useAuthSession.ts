
import { useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';
import { toast } from 'sonner';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const retryAttemptsRef = useRef<Record<string, number>>({});
  const lastOperationRef = useRef<string>('');
  const authInitializedRef = useRef(false);

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      console.log(`[AuthProvider] Clearing loading timeout for: ${lastOperationRef.current}`);
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const setLoadingWithTimeout = (loading: boolean, operation: string) => {
    console.log(`[AuthProvider] ${loading ? 'START' : 'END'} loading state for: ${operation}`);
    lastOperationRef.current = operation;
    clearLoadingTimeout();
    
    setIsLoading(loading);
    
    if (loading) {
      console.log(`[AuthProvider] Setting loading timeout for: ${operation}`);
      loadingTimeoutRef.current = setTimeout(() => {
        console.log(`[AuthProvider] TIMEOUT reached for: ${operation}`);
        setIsLoading(false);
        if (operation !== 'initial-auth-check') {
          toast.error(`Operation timed out: ${operation}. Please try again.`);
        }
      }, 15000); // 15 second timeout
    }
  };

  return {
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
    retryAttemptsRef,
    lastOperationRef,
    authInitializedRef
  };
};
