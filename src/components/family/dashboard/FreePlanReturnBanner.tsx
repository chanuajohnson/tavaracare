import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

/**
 * Shown when an admin has moved a family to the Free plan after a cancellation.
 * Warm welcome-back tone — no pressure — invites them to restart matching.
 */
export const FreePlanReturnBanner: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('account_status, full_name')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled || !data) return;
      setStatus((data as any).account_status ?? null);
      const full = (data as any).full_name as string | null;
      setFirstName(full ? full.split(' ')[0] : '');
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (status !== 'free_only') return null;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10 mb-6">
      <CardContent className="py-5 px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Heart className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">
              We're still here for you{firstName ? `, ${firstName}` : ''} 💙
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Your active subscription is paused. Whenever you're ready, you can restart with a
              one-time Caregiver Matching &amp; Placement and reactivate your weekly care
              management plan. We'd love to walk this next step with you — at your pace.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button asChild size="sm">
            <Link to="/family/billing">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart Matching
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/support">
              <MessageCircle className="h-4 w-4 mr-2" />
              Talk to Coordinator
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
