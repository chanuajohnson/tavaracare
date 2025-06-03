
import { useState, useEffect } from 'react';
import { TavaraState } from '../types';
import { useAuth } from '@/components/providers/AuthProvider';

export const useTavaraState = () => {
  const { user } = useAuth();
  const [state, setState] = useState<TavaraState>({
    isOpen: false,
    isMinimized: false,
    hasUnreadNudges: false,
    currentRole: null
  });

  useEffect(() => {
    if (user) {
      // Determine user role from profiles table or default to family
      setState(prev => ({
        ...prev,
        currentRole: 'family' // This will be enhanced to read from profiles
      }));
    } else {
      setState(prev => ({
        ...prev,
        currentRole: 'guest'
      }));
    }
  }, [user]);

  const openPanel = () => {
    setState(prev => ({ ...prev, isOpen: true, isMinimized: false }));
  };

  const closePanel = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const minimizePanel = () => {
    setState(prev => ({ ...prev, isMinimized: true, isOpen: false }));
  };

  const markNudgesAsRead = () => {
    setState(prev => ({ ...prev, hasUnreadNudges: false }));
  };

  return {
    state,
    openPanel,
    closePanel,
    minimizePanel,
    markNudgesAsRead
  };
};
