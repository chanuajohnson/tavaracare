import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Settings, Gift, Lock, Ban, Trash2, RotateCcw } from 'lucide-react';
import {
  useUserAccountStatus,
  AccountActionType,
  AccountStatus,
} from '@/hooks/admin/useUserAccountStatus';

interface ManageUserMenuProps {
  userId: string;
  userFullName: string;
  userRole: string;
  currentStatus?: AccountStatus;
  onAfterChange?: () => void;
  onDeleteUser?: () => void;
}

interface ActionConfig {
  type: AccountActionType;
  label: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  confirmText: string;
  variantDestructive?: boolean;
}

const ACTIONS: ActionConfig[] = [
  {
    type: 'move_to_free',
    label: 'Move to Free Plan',
    icon: <Gift className="h-4 w-4 mr-2" />,
    title: 'Move user to Free plan',
    description:
      'Cancels paid features and revokes matching pool access. The family will see a warm welcome-back banner inviting them to restart matching.',
    confirmText: 'Move to Free',
  },
  {
    type: 'limit_access',
    label: 'Limit Access (read-only)',
    icon: <Lock className="h-4 w-4 mr-2" />,
    title: 'Limit account access',
    description: 'Account becomes read-only. New bookings, chats, and submissions are blocked.',
    confirmText: 'Limit Access',
  },
  {
    type: 'ban_user',
    label: 'Ban User',
    icon: <Ban className="h-4 w-4 mr-2" />,
    title: 'Ban user',
    description:
      'User is blocked from logging in and will see an "Account suspended — contact support" message.',
    confirmText: 'Ban User',
    variantDestructive: true,
  },
  {
    type: 'restore_active',
    label: 'Restore to Active',
    icon: <RotateCcw className="h-4 w-4 mr-2" />,
    title: 'Restore account to Active',
    description: 'Re-enables full access. Re-invite to matching pool manually if needed.',
    confirmText: 'Restore',
  },
];

export const ManageUserMenu: React.FC<ManageUserMenuProps> = ({
  userId,
  userFullName,
  userRole,
  currentStatus,
  onAfterChange,
  onDeleteUser,
}) => {
  const { applyAction, isSaving } = useUserAccountStatus();
  const [activeAction, setActiveAction] = useState<ActionConfig | null>(null);
  const [reason, setReason] = useState('');

  const isAdmin = userRole === 'admin';

  const handleConfirm = async () => {
    if (!activeAction) return;
    const ok = await applyAction({
      targetUserId: userId,
      previousStatus: currentStatus ?? 'active',
      actionType: activeAction.type,
      reason: reason.trim() || `Admin action: ${activeAction.label}`,
    });
    if (ok) {
      setActiveAction(null);
      setReason('');
      onAfterChange?.();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isAdmin}
            onClick={(e) => e.stopPropagation()}
            title={isAdmin ? 'Cannot manage admin users' : `Manage ${userFullName}`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="w-56 z-50 bg-popover"
        >
          {ACTIONS.map((a) => (
            <DropdownMenuItem
              key={a.type}
              onSelect={() => {
                setReason('');
                setActiveAction(a);
              }}
              className={a.variantDestructive ? 'text-destructive focus:text-destructive' : ''}
            >
              {a.icon}
              {a.label}
            </DropdownMenuItem>
          ))}
          {onDeleteUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => onDeleteUser()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!activeAction} onOpenChange={(open) => !open && setActiveAction(null)}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{activeAction?.title}</DialogTitle>
            <DialogDescription>
              {activeAction?.description}
              <span className="block mt-2 text-foreground font-medium">
                Target: {userFullName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="manage-reason">Reason (visible to admins)</Label>
            <Textarea
              id="manage-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Family cancelled subscription after trust break with assigned nurse on Fri 8 May. Forfeiting matching at this time."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveAction(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant={activeAction?.variantDestructive ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : activeAction?.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
