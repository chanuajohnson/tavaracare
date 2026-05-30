import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type GuardrailRuleType = 'word' | 'financial_allow' | 'financial_deny' | 'tone';
export type GuardrailScope = 'family_facing' | 'caregiver_facing' | 'internal' | 'all';
export type GuardrailSeverity = 'hard' | 'soft';

export interface LanguageGuardrail {
  id: string;
  rule_type: GuardrailRuleType;
  banned_term: string | null;
  preferred_term: string | null;
  body: string;
  scope: GuardrailScope;
  severity: GuardrailSeverity;
  is_active: boolean;
  display_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuardrailAuditEntry {
  id: string;
  guardrail_id: string | null;
  action: 'created' | 'updated' | 'archived' | 'restored' | 'deleted';
  changed_by: string | null;
  changed_at: string;
  before: any;
  after: any;
}

const TABLE = 'language_guardrails' as const;

export function useLanguageGuardrails(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['language_guardrails', opts.includeInactive ?? false],
    queryFn: async (): Promise<LanguageGuardrail[]> => {
      let q = supabase.from(TABLE).select('*').order('rule_type').order('display_order');
      if (!opts.includeInactive) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as LanguageGuardrail[];
    },
  });
}

export function useGuardrailAudit(limit = 30) {
  return useQuery({
    queryKey: ['language_guardrails_audit', limit],
    queryFn: async (): Promise<GuardrailAuditEntry[]> => {
      const { data, error } = await supabase
        .from('language_guardrails_audit')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as GuardrailAuditEntry[];
    },
  });
}

export function useUpsertGuardrail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<LanguageGuardrail> & { id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (input.id) {
        // Strip server-managed fields so UPDATE only touches editable columns.
        const { id, created_by, created_at, updated_at, ...rest } = input as any;
        const payload: any = { ...rest, updated_by: user?.id ?? null };
        const { data, error } = await supabase
          .from(TABLE)
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const payload: any = {
        ...input,
        created_by: user?.id ?? null,
        updated_by: user?.id ?? null,
      };
      const { data, error } = await supabase
        .from(TABLE)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['language_guardrails'] });
      qc.invalidateQueries({ queryKey: ['language_guardrails_audit'] });
      toast.success('Guardrail saved');
    },
    onError: (e: any) => toast.error(e.message ?? 'Failed to save guardrail'),
  });
}

export function useToggleGuardrail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from(TABLE)
        .update({ is_active, updated_by: user?.id ?? null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['language_guardrails'] });
      qc.invalidateQueries({ queryKey: ['language_guardrails_audit'] });
    },
    onError: (e: any) => toast.error(e.message ?? 'Failed to toggle'),
  });
}
