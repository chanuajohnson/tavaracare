
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface ReturningUserState {
  isReturningUser: boolean;
  lastRole: string | null;
  hasVisitedBefore: boolean;
}

export const useReturningUser = () => {
  const { user } = useAuth();
  const [returningUserState, setReturningUserState] = useState<ReturningUserState>({
    isReturningUser: false,
    lastRole: null,
    hasVisitedBefore: false
  });

  useEffect(() => {
    // Check for various indicators of a returning user
    const checkReturningUser = () => {
      const hasVisitedFamily = localStorage.getItem('tavara_visited_family') === 'true';
      const hasVisitedProfessional = localStorage.getItem('tavara_visited_professional') === 'true';
      const hasVisitedCommunity = localStorage.getItem('tavara_visited_community') === 'true';
      const registeringAs = localStorage.getItem('registeringAs');
      const hasAuthTokens = localStorage.getItem('supabase.auth.token') !== null || 
                           Object.keys(localStorage).some(key => key.includes('sb-'));
      
      // Determine last role preference
      let lastRole = null;
      if (registeringAs) {
        lastRole = registeringAs;
      } else if (hasVisitedProfessional) {
        lastRole = 'professional';
      } else if (hasVisitedFamily) {
        lastRole = 'family';
      } else if (hasVisitedCommunity) {
        lastRole = 'community';
      }

      const hasVisitedBefore = hasVisitedFamily || hasVisitedProfessional || hasVisitedCommunity;
      const isReturningUser = !user && (hasVisitedBefore || hasAuthTokens || !!registeringAs);

      setReturningUserState({
        isReturningUser,
        lastRole,
        hasVisitedBefore
      });
    };

    checkReturningUser();
  }, [user]);

  return returningUserState;
};
