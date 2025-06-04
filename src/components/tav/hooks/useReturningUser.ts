
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface ReturningUserState {
  isReturningUser: boolean;
  lastRole: string | null;
  hasVisitedBefore: boolean;
  detectionMethod: string;
}

export const useReturningUser = () => {
  const { user } = useAuth();
  const [returningUserState, setReturningUserState] = useState<ReturningUserState>({
    isReturningUser: false,
    lastRole: null,
    hasVisitedBefore: false,
    detectionMethod: ''
  });

  useEffect(() => {
    // Enhanced detection methods for returning users
    const checkReturningUser = () => {
      let detectionMethod = '';
      let hasVisitedBefore = false;
      let lastRole = null;
      let isReturningUser = false;

      // Method 1: Check explicit visit flags
      const hasVisitedFamily = localStorage.getItem('tavara_visited_family') === 'true';
      const hasVisitedProfessional = localStorage.getItem('tavara_visited_professional') === 'true';
      const hasVisitedCommunity = localStorage.getItem('tavara_visited_community') === 'true';
      
      // Method 2: Check registration intent
      const registeringAs = localStorage.getItem('registeringAs');
      
      // Method 3: Check for any Supabase auth remnants
      const hasAuthTokens = localStorage.getItem('supabase.auth.token') !== null || 
                           Object.keys(localStorage).some(key => key.includes('sb-'));
      
      // Method 4: Check for any Tavara-related data
      const hasTavaraData = Object.keys(localStorage).some(key => 
        key.toLowerCase().includes('tavara') || 
        key.toLowerCase().includes('tav') ||
        key.includes('chat_') ||
        key.includes('registration_')
      );
      
      // Method 5: Check session storage for current session data
      const hasSessionData = sessionStorage.getItem('tavara_session_started') === 'true' ||
                            Object.keys(sessionStorage).some(key => key.includes('tavara'));
      
      // Method 6: Check for form data or chat history
      const hasFormData = localStorage.getItem('chat_form_data') !== null ||
                         localStorage.getItem('registration_progress') !== null;

      // Determine if user has visited before (more inclusive)
      hasVisitedBefore = hasVisitedFamily || hasVisitedProfessional || hasVisitedCommunity || 
                        !!registeringAs || hasTavaraData || hasFormData;

      // Determine last role preference with priority order
      if (registeringAs) {
        lastRole = registeringAs;
        detectionMethod = 'Registration intent';
      } else if (hasVisitedFamily) {
        lastRole = 'family';
        detectionMethod = 'Previous family visit';
      } else if (hasVisitedProfessional) {
        lastRole = 'professional';
        detectionMethod = 'Previous professional visit';
      } else if (hasVisitedCommunity) {
        lastRole = 'community';
        detectionMethod = 'Previous community visit';
      } else if (hasTavaraData && !lastRole) {
        // Try to infer from any Tavara data patterns
        const keys = Object.keys(localStorage);
        if (keys.some(key => key.includes('family'))) {
          lastRole = 'family';
          detectionMethod = 'Inferred from data';
        } else if (keys.some(key => key.includes('professional') || key.includes('caregiver'))) {
          lastRole = 'professional';
          detectionMethod = 'Inferred from data';
        } else if (keys.some(key => key.includes('community'))) {
          lastRole = 'community';
          detectionMethod = 'Inferred from data';
        }
      }

      // More aggressive detection - consider user returning if:
      // 1. They have visited before OR
      // 2. They have any auth tokens OR
      // 3. They have any Tavara-related data OR
      // 4. They have session data (current session revisit)
      isReturningUser = !user && (hasVisitedBefore || hasAuthTokens || hasTavaraData || hasSessionData);

      // Also mark as returning if they've been on the site for more than 30 seconds in this session
      const sessionStartTime = sessionStorage.getItem('tavara_session_start_time');
      if (!sessionStartTime) {
        sessionStorage.setItem('tavara_session_start_time', Date.now().toString());
      } else {
        const timeOnSite = Date.now() - parseInt(sessionStartTime);
        if (timeOnSite > 30000) { // 30 seconds
          isReturningUser = true;
          if (!detectionMethod) detectionMethod = 'Extended session';
        }
      }

      // If no specific role detected but they're clearly returning, default to most common
      if (isReturningUser && !lastRole) {
        lastRole = 'family'; // Default to family as most common user type
        if (!detectionMethod) detectionMethod = 'Default inference';
      }

      console.log('TAV: Enhanced returning user detection:', {
        isReturningUser,
        lastRole,
        hasVisitedBefore,
        detectionMethod,
        hasAuthTokens,
        hasTavaraData,
        hasSessionData
      });

      setReturningUserState({
        isReturningUser,
        lastRole,
        hasVisitedBefore,
        detectionMethod
      });
    };

    checkReturningUser();
    
    // Also check periodically in case user interacts with the site
    const interval = setInterval(checkReturningUser, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  return returningUserState;
};
