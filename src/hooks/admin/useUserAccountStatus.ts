import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AccountStatus = 'active' | 'free_only' | 'limited' | 'banned' | 'deleted';

export type AccountActionType =
  | 'move_to_free'
  | 'limit_access'
  | 'ban_user'
  | 'restore_active'
  | 'delete_user'
  | 'note';

const ACTION_TO_STATUS: Record<AccountActionType, AccountStatus | null> = {
  move_to_free: 'free_only',
  limit_access: 'limited',
  ban_user: 'banned',
  restore_active: 'active',
  delete_user: 'deleted',
  note: null,
};

interface ApplyArgs {
  targetUserId: string;
  previousStatus?: AccountStatus | null;
  actionType: AccountActionType;
  reason: string;
  metadata?: Record<string, unknown>;
}

export function useUserAccountStatus() {
  const [isSaving, setIsSaving] = useState(false);

  const applyAction = async ({
    targetUserId,
    previousStatus,
    actionType,
    reason,
    metadata,
  }: ApplyArgs): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const adminId = authData.user?.id;
      if (!adminId) throw new Error('Not authenticated');

      const newStatus = ACTION_TO_STATUS[actionType];

      // Update profile status (skip for plain notes)
      if (newStatus) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            account_status: newStatus,
            account_status_reason: reason,
            account_status_changed_at: new Date().toISOString(),
            account_status_changed_by: adminId,
            // For free_only, also pull them out of the matching pool
            ...(newStatus === 'free_only' || newStatus === 'banned' || newStatus === 'limited'
              ? { available_for_matching: false }
              : {}),
          })
          .eq('id', targetUserId);
        if (profileErr) throw profileErr;
      }

      // Log the action
      const { error: logErr } = await supabase.from('admin_user_actions').insert([{
        admin_id: adminId,
        target_user_id: targetUserId,
        action_type: actionType,
        previous_status: previousStatus ?? null,
        new_status: newStatus,
        reason,
        metadata: (metadata ?? {}) as any,
      }]);
      if (logErr) throw logErr;

      // For ban/restore, also flip the underlying Supabase auth ban so the user
      // truly cannot obtain a session (in addition to the in-app gate).
      if (actionType === 'ban_user' || actionType === 'restore_active') {
        try {
          await supabase.functions.invoke('admin-ban-user', {
            body: {
              target_user_id: targetUserId,
              action: actionType === 'ban_user' ? 'ban' : 'unban',
            },
          });
        } catch (e) {
          console.warn('[useUserAccountStatus] auth-level ban toggle failed (in-app gate still applies):', e);
        }
      }

      toast.success(`Action recorded: ${actionType.replace(/_/g, ' ')}`);
      return true;
    } catch (err: any) {
      console.error('[useUserAccountStatus] error:', err);
      toast.error(err.message || 'Failed to apply action');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { applyAction, isSaving };
}
