
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { TavaraState } from '../types';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'react-router-dom';

type RealTimeMessage = { 
  text: string; 
  isFinal: boolean; 
  meta?: Record<string, any> 
};

type RealTimeListener = (msg: RealTimeMessage) => void;

interface TavaraStateContextType {
  state: TavaraState & { isDemoMode: boolean; isChatMode: boolean; chatMessageCount: number };
  openPanel: () => void;
  closePanel: () => void;
  minimizePanel: () => void;
  maximizePanel: () => void;
  markNudgesAsRead: () => void;
  enterChatMode: () => void;
  exitChatMode: () => void;
  incrementMessageCount: () => void;
  resetMessageCount: () => void;
  registerRealTimeListener: (fn: RealTimeListener) => () => void;
  emitRealTimeMessage: (msg: RealTimeMessage) => void;
  realTimeDataCallback?: (message: string, isUser: boolean) => void; // Backward compatibility
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
  console.log('🔗 [TavaraStateProvider] Initialized with callback:', !!realTimeDataCallback);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<TavaraState & { isDemoMode: boolean; isChatMode: boolean; chatMessageCount: number }>({
    isOpen: false,
    isMinimized: false,
    hasUnreadNudges: false,
    currentRole: null,
    isDemoMode: false,
    isChatMode: false,
    chatMessageCount: 0
  });

  // Real-time message bus
  const listenersRef = useRef<Set<RealTimeListener>>(new Set());

  const registerRealTimeListener = useCallback((fn: RealTimeListener) => {
    console.log('🔗 [TavaraStateProvider] Registering real-time listener');
    listenersRef.current.add(fn);
    return () => {
      console.log('🧹 [TavaraStateProvider] Unregistering real-time listener');
      listenersRef.current.delete(fn);
    };
  }, []);

  const emitRealTimeMessage = useCallback((msg: RealTimeMessage) => {
    console.log('📡 [TavaraStateProvider] Emitting real-time message:', { 
      preview: msg.text.slice(0, 80), 
      isFinal: msg.isFinal, 
      listenerCount: listenersRef.current.size 
    });
    
    // New message bus system
    for (const fn of listenersRef.current) {
      try {
        fn(msg);
      } catch (error) {
        console.error('🚨 [TavaraStateProvider] Listener error:', error);
      }
    }
    
    // Backward compatibility with old callback system
    if (realTimeDataCallback) {
      try {
        realTimeDataCallback(msg.text, !msg.isFinal);
      } catch (error) {
        console.error('🚨 [TavaraStateProvider] Legacy callback error:', error);
      }
    }
  }, [realTimeDataCallback]);

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

  const enterChatMode = () => {
    console.log('TAV: Entering chat mode');
    setState(prev => ({ ...prev, isChatMode: true }));
  };

  const exitChatMode = () => {
    console.log('TAV: Exiting chat mode');
    setState(prev => ({ ...prev, isChatMode: false, chatMessageCount: 0 }));
  };

  const incrementMessageCount = () => {
    setState(prev => ({ ...prev, chatMessageCount: prev.chatMessageCount + 1 }));
  };

  const resetMessageCount = () => {
    setState(prev => ({ ...prev, chatMessageCount: 0 }));
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
        enterChatMode,
        exitChatMode,
        incrementMessageCount,
        resetMessageCount,
        registerRealTimeListener,
        emitRealTimeMessage,
        realTimeDataCallback
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
