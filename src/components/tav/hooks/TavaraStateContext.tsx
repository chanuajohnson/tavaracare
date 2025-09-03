
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TavaraState } from '../types';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useLocation } from 'react-router-dom';

interface TavaraStateContextType {
  state: TavaraState & { isDemoMode: boolean };
  openPanel: () => void;
  closePanel: () => void;
  minimizePanel: () => void;
  maximizePanel: () => void;
  markNudgesAsRead: () => void;
}

const TavaraStateContext = createContext<TavaraStateContextType | undefined>(undefined);

interface TavaraStateProviderProps {
  children: ReactNode;
}

export const TavaraStateProvider: React.FC<TavaraStateProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [state, setState] = useState<TavaraState & { isDemoMode: boolean }>({
    isOpen: false,
    isMinimized: false,
    hasUnreadNudges: false,
    currentRole: null,
    isDemoMode: false
  });

  // IMMEDIATE demo mode detection and locking
  useEffect(() => {
    const urlParamsDemo = searchParams.get('demo') === 'true' && searchParams.get('role') === 'guest';
    const isOnTavDemoRoute = location.pathname === '/tav-demo';
    const hasActiveDemoSession = sessionStorage.getItem('tavara_demo_session') === 'true';
    const isDemoModeLocked = sessionStorage.getItem('tavara_demo_mode_locked') === 'true';
    
    // IMMEDIATE DEMO MODE LOCKING: Lock demo mode immediately when on /tav-demo route
    if (isOnTavDemoRoute) {
      console.log('TAV Context: IMMEDIATE demo mode lock on /tav-demo route');
      sessionStorage.setItem('tavara_demo_session', 'true');
      sessionStorage.setItem('tavara_demo_mode_locked', 'true');
    }
    
    // PRIORITIZE SESSION STORAGE: session storage is now primary detection method
    const isDemoMode = isDemoModeLocked || hasActiveDemoSession || isOnTavDemoRoute || urlParamsDemo;
    
    // Clear demo session if user navigates away from demo flows (but respect locked demo mode)
    if (!urlParamsDemo && !isOnTavDemoRoute && !location.pathname.includes('/registration/') && !location.pathname.includes('/family/') && !isDemoModeLocked) {
      if (hasActiveDemoSession) {
        console.log('TAV: Clearing demo session - user navigated away from demo flows');
        sessionStorage.removeItem('tavara_demo_session');
        sessionStorage.removeItem('tavara_demo_mode_locked');
      }
    }
    
    console.log('TAV Context: Enhanced demo mode detection:', {
      urlParamsDemo,
      isOnTavDemoRoute,
      hasActiveDemoSession,
      isDemoModeLocked,
      isDemoMode,
      pathname: location.pathname
    });
    
    setState(prev => ({
      ...prev,
      isDemoMode
    }));
  }, [searchParams, location.pathname]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const urlParamsDemo = searchParams.get('demo') === 'true' && searchParams.get('role') === 'guest';
      const isOnTavDemoRoute = location.pathname === '/tav-demo';
      const hasActiveDemoSession = sessionStorage.getItem('tavara_demo_session') === 'true';
      const isDemoModeLocked = sessionStorage.getItem('tavara_demo_mode_locked') === 'true';
      const isDemoMode = urlParamsDemo || isOnTavDemoRoute || hasActiveDemoSession || isDemoModeLocked;
      
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          setState(prev => ({
            ...prev,
            currentRole: profile?.role || 'family',
            isDemoMode
          }));
        } catch (error) {
          console.error('Error fetching user role:', error);
          setState(prev => ({
            ...prev,
            currentRole: 'family',
            isDemoMode
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          currentRole: isDemoMode ? 'guest' : 'guest',
          isDemoMode
        }));
      }
    };

    fetchUserRole();
  }, [user, searchParams, location.pathname]);

  const openPanel = () => {
    console.log('TAV: Opening panel');
    setState(prev => ({ ...prev, isOpen: true, isMinimized: false }));
  };

  const closePanel = () => {
    console.log('TAV: Closing panel');
    setState(prev => ({ ...prev, isOpen: false, isMinimized: false }));
  };

  const minimizePanel = () => {
    console.log('TAV: Minimizing panel');
    setState(prev => ({ ...prev, isMinimized: true, isOpen: true }));
  };

  const maximizePanel = () => {
    console.log('TAV: Maximizing panel');
    setState(prev => ({ ...prev, isMinimized: false, isOpen: true }));
  };

  const markNudgesAsRead = () => {
    console.log('TAV: Marking nudges as read');
    setState(prev => ({ ...prev, hasUnreadNudges: false }));
  };

  return (
    <TavaraStateContext.Provider
      value={{
        state,
        openPanel,
        closePanel,
        minimizePanel,
        maximizePanel,
        markNudgesAsRead
      }}
    >
      {children}
    </TavaraStateContext.Provider>
  );
};

export const useTavaraState = () => {
  const context = useContext(TavaraStateContext);
  if (context === undefined) {
    throw new Error('useTavaraState must be used within a TavaraStateProvider');
  }
  return context;
};
