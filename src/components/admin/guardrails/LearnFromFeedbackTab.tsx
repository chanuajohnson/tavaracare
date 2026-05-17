import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Proposal {
  id: string;
  rule_type: 'word' | 'tone' | 'financial_deny' | 'financial_allow';
  banned_term: string | null;
  preferred_term: string | null;
  body: string;
  scope: string;
  severity: 'hard' | 'soft';
  rationale: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export function LearnFromFeedbackTab() {
  const qc = useQueryClient();
  const [feedback, setFeedback] = useState('');
  const [extracting, setExtracting] = useState(false);

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['guardrail_proposals'],
    queryFn: async (): Promise<Proposal[]> => {
      const { data, error } = await supabase
        .from('guardrail_proposals' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as Proposal[];
    },
  });

  const extract = async () => {
    if (feedback.trim().length < 20) {
      toast.error('Paste at least 20 characters of reviewer feedback.');
      return;
    }
    setExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('guardrails-extract-rules', {
        body: { feedback },
      });
      if (error) throw error;
      const count = (data as any)?.totalExtracted ?? 0;
      toast.success(`Extracted ${count} candidate rule${count === 1 ? '' : 's'}.`);
      setFeedback('');
      qc.invalidateQueries({ queryKey: ['guardrail_proposals'] });
    } catch (e: any) {
      toast.error(e?.message ?? 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Learn from feedback
          </CardTitle>
          <CardDescription>
            Paste reviewer feedback (an editorial review, a TAV breach screenshot transcript, etc.).
            The AI extracts new guardrail rules implied by the feedback and queues them here for your review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={10}
            placeholder='Example: "Stop saying paid directly to caregiver. Tavara coordinates payment. Also avoid placement fee, that sounds like staffing."'
          />
          <div className="flex justify-end">
            <Button onClick={extract} disabled={extracting}>
              {extracting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Extract proposed rules
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending proposals</CardTitle>
          <CardDescription>Accept to add to the live rule set. Reject to keep the system from re-proposing.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals yet.</p>
          ) : (
            <div className="space-y-2">
              {proposals.map((p) => (
                <ProposalRow key={p.id} proposal={p} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProposalRow({ proposal }: { proposal: Proposal }) {
  const qc = useQueryClient();
  const [banned, setBanned] = useState(proposal.banned_term ?? '');
  const [preferred, setPreferred] = useState(proposal.preferred_term ?? '');
  const [body, setBody] = useState(proposal.body);

  const accept = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: rule, error: insErr } = await supabase
        .from('language_guardrails')
        .insert({
          rule_type: proposal.rule_type,
          banned_term: banned || null,
          preferred_term: preferred || null,
          body,
          scope: proposal.scope,
          severity: proposal.severity,
          is_active: true,
          display_order: 500,
          created_by: user?.id ?? null,
        })
        .select()
        .single();
      if (insErr) throw insErr;
      const { error: upErr } = await supabase
        .from('guardrail_proposals' as any)
        .update({
          status: 'accepted',
          accepted_rule_id: rule.id,
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', proposal.id);
      if (upErr) throw upErr;
    },
    onSuccess: () => {
      toast.success('Rule added and enforced everywhere');
      qc.invalidateQueries({ queryKey: ['guardrail_proposals'] });
      qc.invalidateQueries({ queryKey: ['language_guardrails'] });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to accept'),
  });

  const reject = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('guardrail_proposals' as any)
        .update({
          status: 'rejected',
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', proposal.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Proposal rejected');
      qc.invalidateQueries({ queryKey: ['guardrail_proposals'] });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to reject'),
  });

  if (proposal.status !== 'pending') {
    return (
      <div className="border rounded p-2 text-xs text-muted-foreground flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">{proposal.status}</Badge>
        <span className="font-medium">{proposal.banned_term ?? proposal.body.slice(0, 60)}</span>
      </div>
    );
  }

  return (
    <div className="border rounded p-3 space-y-2 bg-card">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <Badge variant="outline">{proposal.rule_type}</Badge>
        <Badge variant={proposal.severity === 'hard' ? 'destructive' : 'outline'}>{proposal.severity}</Badge>
        <Badge variant="secondary">{proposal.scope}</Badge>
        {proposal.rationale && (
          <span className="text-muted-foreground italic">{proposal.rationale}</span>
        )}
      </div>
      {(proposal.rule_type === 'word' || proposal.rule_type === 'tone' || proposal.rule_type === 'financial_deny') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-medium">Banned term</label>
            <Input value={banned} onChange={(e) => setBanned(e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] font-medium">Preferred replacement</label>
            <Input value={preferred} onChange={(e) => setPreferred(e.target.value)} />
          </div>
        </div>
      )}
      <div>
        <label className="text-[11px] font-medium">Reason / context</label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={() => reject.mutate()} disabled={reject.isPending}>
          <X className="h-4 w-4 mr-1" /> Reject
        </Button>
        <Button size="sm" onClick={() => accept.mutate()} disabled={accept.isPending}>
          <Check className="h-4 w-4 mr-1" /> Accept &amp; activate
        </Button>
      </div>
    </div>
  );
}
