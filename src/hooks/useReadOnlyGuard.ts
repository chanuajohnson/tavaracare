import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccountStatus } from '@/components/auth/AccountStatusGate';

/**
 * useReadOnlyGuard
 *
 * Returns helpers to enforce account read-only state on the client.
 * Pair with the DB-level RESTRICTIVE policies (see is_account_limited)
 * so users with account_status='limited' (or banned/deleted) cannot edit
 * or delete anything — even from the UI.
 */
export const READ_ONLY_TOOLTIP =
  'Read-only mode — contact your coordinator to make changes.';

export function useReadOnlyGuard() {
  const { isReadOnly, isLimited, isBanned, status } = useAccountStatus();
  const blocked = isReadOnly || isLimited || isBanned;

  const blockIfReadOnly = useCallback(
    (label?: string): boolean => {
      if (!blocked) return false;
      toast.error(label ? `${label} is disabled in read-only mode.` : READ_ONLY_TOOLTIP, {
        description: 'Please contact your coordinator to make changes.',
      });
      return true;
    },
    [blocked]
  );

  /** Wrap a handler so it short-circuits with a toast when read-only. */
  const guard = useCallback(
    <T extends (...args: any[]) => any>(fn: T, label?: string) =>
      ((...args: Parameters<T>) => {
        if (blockIfReadOnly(label)) return undefined as ReturnType<T>;
        return fn(...args);
      }) as T,
    [blockIfReadOnly]
  );

  return {
    isReadOnly: blocked,
    status,
    tooltip: blocked ? READ_ONLY_TOOLTIP : undefined,
    /** Spread on Buttons / inputs to disable + signal read-only. */
    readOnlyProps: blocked
      ? { disabled: true, 'aria-disabled': true, title: READ_ONLY_TOOLTIP }
      : {},
    blockIfReadOnly,
    guard,
  };
}
