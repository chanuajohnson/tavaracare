import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Phone } from 'lucide-react';
import { useAccountStatus } from '@/components/auth/AccountStatusGate';

/**
 * Shown when an admin has placed the family account into Limited Access mode.
 * Displays the admin-entered reason and routes the family to a coordinator.
 */
export const LimitedAccessBanner: React.FC = () => {
  const { status, reason } = useAccountStatus();

  if (status !== 'limited') return null;

  const waText = encodeURIComponent(
    `Hi Tavara, my account is in limited access. Reason given: "${reason ?? 'No reason provided'}". Can we talk?`
  );
  const waHref = `https://wa.me/18687865357?text=${waText}`;

  return (
    <Card className="border-amber-300 bg-amber-50 mb-6">
      <CardContent className="py-5 px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Lock className="h-6 w-6 text-amber-700 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900">
              Your account is in limited access
            </h3>
            <p className="text-sm text-amber-900/80 mt-1 max-w-2xl">
              Your dashboard is in <strong>read-only mode</strong>. You can still view everything —
              care plan, shifts, medications, meals, messages and records — but creating, editing,
              or deleting is paused. Please reach out to your coordinator to restore full access.
            </p>
            {reason && (
              <blockquote className="mt-3 border-l-4 border-amber-400 pl-3 text-sm italic text-amber-900/90 bg-amber-100/60 py-2 pr-2 rounded-sm">
                <span className="block text-xs font-medium uppercase tracking-wide text-amber-700 not-italic mb-0.5">
                  Note from your coordinator
                </span>
                "{reason}"
              </blockquote>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button asChild size="sm">
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp Coordinator
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
