
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TavaraState } from '../types';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'react-router-dom';
import { realTimeCallbackService } from '@/services/realTimeCallbackService';

interface TavaraStateContextType {
  state: TavaraState & { isDemoMode: boolean };
  openPanel: () => void;
  closePanel: () => void;
  minimizePanel: () => void;
  maximizePanel: () => void;
  markNudgesAsRead: () => void;
  realTimeDataCallback?: (message: string, isUser: boolean) => void;
}

const TavaraStateContext = createContext<TavaraStateContextType | undefined>(undefined);

interface TavaraStateProviderProps {
  children: ReactNode;
  initialRole?: 'guest' | 'family' | 'professional' | 'community' | null;
  forceDemoMode?: boolean;
  realTimeDataCallback?: (message: string, isUser: boolean) => void;
}

export const TavaraStateProvider: React.FC<TavaraStateProviderProps> = ({ 
  children, 
  initialRole = null,
  forceDemoMode = false,
  realTimeDataCallback
}) => {
  // DEBUG: Log callback availability
  console.warn('🔗 [TavaraStateProvider] realTimeDataCallback provided:', !!realTimeDataCallback);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<TavaraState & { isDemoMode: boolean }>({
    isOpen: false,
    isMinimized: false,
    hasUnreadNudges: false,
    currentRole: null,
    isDemoMode: false
  });

  // Demo mode detection - prioritize route-based detection
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isDemoRoute = currentPath.startsWith('/demo/') || currentPath === '/tav-demo';
    const isUrlParamDemo = searchParams.get('demo') === 'true' && searchParams.get('role') === 'guest';
    
    const isDemoMode = forceDemoMode || isDemoRoute || isUrlParamDemo;
    
    console.log('TAV Demo Detection:', { currentPath, isDemoRoute, isDemoMode });
    
    setState(prev => ({
      ...prev,
      isDemoMode,
      currentRole: isDemoMode ? (initialRole || 'guest') : prev.currentRole
    }));
  }, [searchParams, forceDemoMode, initialRole]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const currentPath = window.location.pathname;
      const isDemoRoute = currentPath.startsWith('/demo/') || currentPath === '/tav-demo';
      const isUrlParamDemo = searchParams.get('demo') === 'true' && searchParams.get('role') === 'guest';
      const isDemoMode = forceDemoMode || isDemoRoute || isUrlParamDemo;
      
      if (isDemoMode) {
        setState(prev => ({
          ...prev,
          currentRole: initialRole || 'guest',
          isDemoMode: true
        }));
        return;
      }
      
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
            isDemoMode: false
          }));
        } catch (error) {
          console.error('Error fetching user role:', error);
          setState(prev => ({
            ...prev,
            currentRole: 'family',
            isDemoMode: false
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          currentRole: 'guest',
          isDemoMode: false
        }));
      }
    };

    fetchUserRole();
  }, [user, searchParams, forceDemoMode, initialRole]);

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
        markNudgesAsRead,
        realTimeDataCallback: realTimeDataCallback ? (message: string, isUser: boolean) => {
          console.warn('🔗 [TavaraStateProvider] Direct callback triggered:', { message, isUser });
          realTimeDataCallback(message, isUser);
        } : realTimeCallbackService.hasCallback() ? (message: string, isUser: boolean) => {
          console.warn('🔗 [TavaraStateProvider] Using global callback service:', { message, isUser });
          realTimeCallbackService.executeCallback(message, isUser);
        } : undefined
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
