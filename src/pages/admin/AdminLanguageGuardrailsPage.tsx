import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  useLanguageGuardrails,
  useUpsertGuardrail,
  useToggleGuardrail,
  useGuardrailAudit,
  type LanguageGuardrail,
  type GuardrailRuleType,
  type GuardrailScope,
  type GuardrailSeverity,
} from '@/hooks/admin/useLanguageGuardrails';
import { Loader2, Pencil, Plus, Save, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SCOPES: GuardrailScope[] = ['all', 'family_facing', 'caregiver_facing', 'internal'];
const SEVERITIES: GuardrailSeverity[] = ['hard', 'soft'];

const scopeLabel: Record<GuardrailScope, string> = {
  all: 'All surfaces',
  family_facing: 'Family-facing',
  caregiver_facing: 'Caregiver-facing',
  internal: 'Internal only',
};

function GuardrailEditor({
  initial,
  ruleType,
  onCancel,
  onSaved,
}: {
  initial?: Partial<LanguageGuardrail>;
  ruleType: GuardrailRuleType;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const upsert = useUpsertGuardrail();
  const [draft, setDraft] = useState<Partial<LanguageGuardrail>>({
    rule_type: ruleType,
    scope: 'all',
    severity: 'hard',
    is_active: true,
    display_order: 100,
    ...initial,
  });

  const save = async () => {
    if (ruleType === 'word' && (!draft.banned_term || !draft.preferred_term)) {
      return;
    }
    if (!draft.body) return;
    await upsert.mutateAsync(draft);
    onSaved();
  };

  return (
    <div className="space-y-3 rounded border bg-muted/40 p-3">
      {ruleType === 'word' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium">Banned term</label>
            <Input
              value={draft.banned_term ?? ''}
              onChange={(e) => setDraft({ ...draft, banned_term: e.target.value })}
              placeholder="e.g. hire a caregiver"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Preferred replacement</label>
            <Input
              value={draft.preferred_term ?? ''}
              onChange={(e) => setDraft({ ...draft, preferred_term: e.target.value })}
              placeholder="e.g. arrange care"
            />
          </div>
        </div>
      )}
      <div>
        <label className="text-xs font-medium">
          {ruleType === 'word' ? 'Why this matters' : 'Rule statement'}
        </label>
        <Textarea
          rows={2}
          value={draft.body ?? ''}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-medium">Scope</label>
          <Select value={draft.scope} onValueChange={(v) => setDraft({ ...draft, scope: v as GuardrailScope })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SCOPES.map((s) => <SelectItem key={s} value={s}>{scopeLabel[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium">Severity</label>
          <Select value={draft.severity} onValueChange={(v) => setDraft({ ...draft, severity: v as GuardrailSeverity })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s === 'hard' ? 'Hard ban' : 'Soft preference'}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium">Display order</label>
          <Input
            type="number"
            value={draft.display_order ?? 100}
            onChange={(e) => setDraft({ ...draft, display_order: parseInt(e.target.value) || 100 })}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4 mr-1" />Cancel</Button>
        <Button size="sm" onClick={save} disabled={upsert.isPending}>
          {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
      </div>
    </div>
  );
}

function GuardrailRow({ rule }: { rule: LanguageGuardrail }) {
  const [editing, setEditing] = useState(false);
  const toggle = useToggleGuardrail();

  if (editing) {
    return (
      <GuardrailEditor
        ruleType={rule.rule_type}
        initial={rule}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 p-3 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        {rule.rule_type === 'word' ? (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="destructive" className="font-mono text-xs">{rule.banned_term}</Badge>
            <span className="text-muted-foreground text-xs">→</span>
            <Badge variant="outline" className="font-mono text-xs">{rule.preferred_term}</Badge>
            <Badge variant="secondary" className="text-xs">{scopeLabel[rule.scope]}</Badge>
            <Badge variant={rule.severity === 'hard' ? 'destructive' : 'secondary'} className="text-xs">
              {rule.severity}
            </Badge>
            {!rule.is_active && <Badge variant="outline" className="text-xs">Archived</Badge>}
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">{scopeLabel[rule.scope]}</Badge>
            <Badge variant={rule.severity === 'hard' ? 'destructive' : 'secondary'} className="text-xs">
              {rule.severity}
            </Badge>
            {!rule.is_active && <Badge variant="outline" className="text-xs">Archived</Badge>}
          </div>
        )}
        <p className="text-sm mt-1">{rule.body}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Switch
          checked={rule.is_active}
          onCheckedChange={(checked) => toggle.mutate({ id: rule.id, is_active: checked })}
        />
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function GuardrailList({
  ruleType,
  title,
  description,
  rules,
}: {
  ruleType: GuardrailRuleType;
  title: string;
  description: string;
  rules: LanguageGuardrail[];
}) {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      if (!showArchived && !r.is_active) return false;
      if (!search) return true;
      const hay = `${r.banned_term ?? ''} ${r.preferred_term ?? ''} ${r.body}`.toLowerCase();
      return hay.includes(search.toLowerCase());
    });
  }, [rules, search, showArchived]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />Add rule
          </Button>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Input
            placeholder="Search rules…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={showArchived} onCheckedChange={setShowArchived} />
            Show archived
          </label>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {rules.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {adding && (
          <div className="mb-3">
            <GuardrailEditor
              ruleType={ruleType}
              onCancel={() => setAdding(false)}
              onSaved={() => setAdding(false)}
            />
          </div>
        )}
        <div className="rounded border bg-card">
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No rules match.</p>
          ) : (
            filtered.map((r) => <GuardrailRow key={r.id} rule={r} />)
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AuditPanel() {
  const { data, isLoading } = useGuardrailAudit(20);
  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
  if (!data?.length) return <p className="text-sm text-muted-foreground">No changes yet.</p>;
  return (
    <div className="space-y-2">
      {data.map((e) => {
        const label = (e.after?.banned_term as string) || (e.after?.body as string) || (e.before?.banned_term as string) || (e.before?.body as string) || '—';
        return (
          <div key={e.id} className="flex items-start justify-between gap-2 text-xs border-b pb-2">
            <div className="min-w-0 flex-1">
              <Badge variant="outline" className="text-[10px] mr-2">{e.action}</Badge>
              <span className="font-medium">{String(label).slice(0, 80)}</span>
            </div>
            <span className="text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(e.changed_at), { addSuffix: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HowToUseGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />How to use and enforce the guardrails</CardTitle>
        <CardDescription>The rule book for every public surface, chatbot reply, and piece of marketing copy.</CardDescription>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none">
        <h4>1. What guardrails are</h4>
        <p>Non-negotiable language and money rules that shape every public surface. Tavara is a care coordination platform — never an agency, staffing company, or Uber-for-caregivers. We sell continuity and coordination, not caregiver hours.</p>

        <h4>2. Where they show up automatically</h4>
        <ul>
          <li><b>Blog editor panel</b> — the amber guardrails block above the body reads from this catalog. Every edit you make here is live in the editor within a minute.</li>
          <li><b>TAV chatbot</b> — the chatbot fetches active rules from this catalog at the top of every conversation and refuses to use banned terms.</li>
          <li><b>Lovable agent</b> — the always-on memory at <code>mem://constraints/tavara-language-guardrails</code> mirrors these rules.</li>
        </ul>

        <h4>3. How to add a new banned word</h4>
        <ol>
          <li>Open the <b>Word Rules</b> tab.</li>
          <li>Click <b>Add rule</b>.</li>
          <li>Fill in banned term + preferred replacement + a one-line reason.</li>
          <li>Pick scope (family-facing, caregiver-facing, internal, all) and severity (hard ban vs soft preference).</li>
          <li>Save. Live everywhere within the minute.</li>
        </ol>

        <h4>4. How to retire a rule</h4>
        <p>Toggle the row off. The rule is hidden from enforcement but the audit history is kept.</p>

        <h4>5. How to handle a borderline case</h4>
        <p>If a word is fine in one context but not another (e.g. "client" is fine in legal documents, not in family copy), set the scope to <code>family_facing</code> rather than archiving the rule.</p>

        <h4>6. Financial privacy quick reference</h4>
        <p><b>OK to mention publicly:</b> per-hour care rates ($40 / $45 / $50+ — always call them "care rate", never "wage"), subscription tier names (Basic, Active Care, Premium), Matching &amp; Placement $1,399.</p>
        <p><b>NEVER public:</b> subscription dollar amounts, Home Preparation dollar amounts, Day 0 figures, household monthly totals, lifecycle projections. Share these privately during onboarding only.</p>

        <h4>7. Review cadence</h4>
        <p>Quarterly review by the founder. If a rule has not been touched in 90+ days, give it a fresh look during your next review session.</p>

        <h4>8. What to do if TAV breaks a rule</h4>
        <ol>
          <li>Screenshot the failure.</li>
          <li>Add the failure pattern as a new word or tone rule here.</li>
          <li>The next TAV reply will use the updated rules — no redeploy needed.</li>
        </ol>
      </CardContent>
    </Card>
  );
}

export default function AdminLanguageGuardrailsPage() {
  const { data: rules = [], isLoading } = useLanguageGuardrails({ includeInactive: true });

  const grouped = useMemo(() => ({
    word: rules.filter((r) => r.rule_type === 'word'),
    financial_allow: rules.filter((r) => r.rule_type === 'financial_allow'),
    financial_deny: rules.filter((r) => r.rule_type === 'financial_deny'),
    tone: rules.filter((r) => r.rule_type === 'tone'),
  }), [rules]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <DashboardHeader
        breadcrumbItems={[
          { label: 'Admin Dashboard', path: '/admin' },
          { label: 'Language Guardrails', path: '/admin/language-guardrails' },
        ]}
      />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" /> Language Guardrails
          </h1>
          <p className="text-muted-foreground mt-1">
            The single source of truth for what we say (and don't say) on public surfaces, in TAV, and in marketing copy.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">{grouped.word.filter(r => r.is_active).length} active word rules</Badge>
          <Badge variant="secondary">{grouped.financial_allow.filter(r => r.is_active).length + grouped.financial_deny.filter(r => r.is_active).length} financial rules</Badge>
          <Badge variant="secondary">{grouped.tone.filter(r => r.is_active).length} tone rules</Badge>
        </div>
      </div>

      <Card className="bg-amber-50 border-amber-300">
        <CardContent className="p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-950">
            <p className="font-medium">These rules are enforced automatically in the blog editor and the TAV chatbot.</p>
            <p>Changes go live within the minute. Use the "How to use" tab if you are not sure how a rule should be scoped.</p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading rules…</div>
      ) : (
        <Tabs defaultValue="word">
          <TabsList>
            <TabsTrigger value="word">Word Rules ({grouped.word.length})</TabsTrigger>
            <TabsTrigger value="financial">Financial Privacy ({grouped.financial_allow.length + grouped.financial_deny.length})</TabsTrigger>
            <TabsTrigger value="tone">Tone ({grouped.tone.length})</TabsTrigger>
            <TabsTrigger value="how">How to use</TabsTrigger>
            <TabsTrigger value="audit">Recent changes</TabsTrigger>
          </TabsList>

          <TabsContent value="word" className="mt-4">
            <GuardrailList
              ruleType="word"
              title="Banned → preferred"
              description="Words we never use and the language we use instead."
              rules={grouped.word}
            />
          </TabsContent>

          <TabsContent value="financial" className="mt-4 space-y-4">
            <GuardrailList
              ruleType="financial_allow"
              title="OK to mention publicly"
              description="Pricing detail that is allowed on public surfaces."
              rules={grouped.financial_allow}
            />
            <GuardrailList
              ruleType="financial_deny"
              title="Never public"
              description="Pricing detail shared privately during onboarding only."
              rules={grouped.financial_deny}
            />
          </TabsContent>

          <TabsContent value="tone" className="mt-4">
            <GuardrailList
              ruleType="tone"
              title="Tone &amp; style rules"
              description="Voice rules that apply to every editorial surface."
              rules={grouped.tone}
            />
          </TabsContent>

          <TabsContent value="how" className="mt-4">
            <HowToUseGuide />
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent changes</CardTitle>
                <CardDescription>Every create, edit, archive, and restore is logged.</CardDescription>
              </CardHeader>
              <CardContent>
                <AuditPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
