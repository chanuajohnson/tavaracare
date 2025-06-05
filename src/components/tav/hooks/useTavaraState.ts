
import { useState, useEffect } from 'react';
import { TavaraState } from '../types';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export const useTavaraState = () => {
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
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const minimizePanel = () => {
    console.log('TAV: Minimizing panel');
    setState(prev => ({ ...prev, isMinimized: true, isOpen: false }));
  };

  const markNudgesAsRead = () => {
    console.log('TAV: Marking nudges as read');
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
