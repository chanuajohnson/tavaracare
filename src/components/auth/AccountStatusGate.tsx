import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';

export type AccountStatus = 'active' | 'free_only' | 'limited' | 'banned' | 'deleted';

interface AccountStatusContextValue {
  status: AccountStatus;
  reason: string | null;
  isFreeOnly: boolean;
  isLimited: boolean;
  isBanned: boolean;
  isReadOnly: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AccountStatusContext = createContext<AccountStatusContextValue>({
  status: 'active',
  reason: null,
  isFreeOnly: false,
  isLimited: false,
  isBanned: false,
  isReadOnly: false,
  loading: true,
  refresh: async () => {},
});

export const useAccountStatus = () => useContext(AccountStatusContext);

const PUBLIC_PATHS = ['/auth', '/reset-password', '/'];

export const AccountStatusGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<AccountStatus>('active');
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user?.id) {
      setStatus('active');
      setReason(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('account_status, account_status_reason')
        .eq('id', user.id)
        .maybeSingle();
      const s = ((data as any)?.account_status as AccountStatus) ?? 'active';
      const r = ((data as any)?.account_status_reason as string) ?? null;
      setStatus(s);
      setReason(r);

      if (s === 'banned' || s === 'deleted') {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('[AccountStatusGate] signOut failed:', e);
        }
        const params = new URLSearchParams({
          suspended: s,
          ...(r ? { reason: r } : {}),
        });
        navigate(`/auth?${params.toString()}`, { replace: true });
      }
    } catch (err) {
      console.error('[AccountStatusGate] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Re-check on route change for fast feedback after admin action
  useEffect(() => {
    if (user?.id && !PUBLIC_PATHS.includes(location.pathname)) {
      fetchStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const value: AccountStatusContextValue = {
    status,
    reason,
    isFreeOnly: status === 'free_only',
    isLimited: status === 'limited',
    isBanned: status === 'banned' || status === 'deleted',
    isReadOnly: status === 'limited',
    loading,
    refresh: fetchStatus,
  };

  return (
    <AccountStatusContext.Provider value={value}>
      {children}
    </AccountStatusContext.Provider>
  );
};
