
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TavaraState } from '../types';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

interface TavaraStateContextType {
  state: TavaraState;
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
  const [state, setState] = useState<TavaraState>({
    isOpen: false,
    isMinimized: false,
    hasUnreadNudges: false,
    currentRole: null
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          setState(prev => ({
            ...prev,
            currentRole: profile?.role || 'family'
          }));
        } catch (error) {
          console.error('Error fetching user role:', error);
          setState(prev => ({
            ...prev,
            currentRole: 'family'
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          currentRole: 'guest'
        }));
      }
    };

    fetchUserRole();
  }, [user]);

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
