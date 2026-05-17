import { useMemo } from 'react';
import { useLanguageGuardrails, type LanguageGuardrail } from './useLanguageGuardrails';

export interface ScanIssue {
  ruleId: string;
  ruleType: LanguageGuardrail['rule_type'];
  severity: LanguageGuardrail['severity'];
  scope: LanguageGuardrail['scope'];
  banned: string;
  preferred: string | null;
  excerpt: string;
  field: 'title' | 'description' | 'body' | 'faq';
  lineNumber: number;
  matchIndex: number;
  count?: number;
  reason?: string;
}

export interface ScanResult {
  issues: ScanIssue[];
  hardCount: number;
  softCount: number;
  isLoading: boolean;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function scanField(
  field: ScanIssue['field'],
  text: string,
  rules: LanguageGuardrail[],
): ScanIssue[] {
  if (!text) return [];
  const issues: ScanIssue[] = [];
  const lines = text.split('\n');

  for (const rule of rules) {
    if (!rule.is_active) continue;
    if (rule.rule_type !== 'word' && rule.rule_type !== 'tone' && rule.rule_type !== 'financial_deny') continue;
    if (!rule.banned_term) continue;

    // Tone "overuse" rules trigger when count > 1
    const isOveruse = rule.rule_type === 'tone';
    const re = new RegExp(`\\b${escapeRegex(rule.banned_term)}\\b`, 'gi');

    let totalCount = 0;
    const matches: { line: number; excerpt: string; index: number }[] = [];
    lines.forEach((line, idx) => {
      let m: RegExpExecArray | null;
      const lineRe = new RegExp(re.source, 'gi');
      while ((m = lineRe.exec(line)) !== null) {
        totalCount += 1;
        matches.push({ line: idx + 1, excerpt: line.trim().slice(0, 160), index: m.index });
      }
    });

    if (matches.length === 0) continue;
    if (isOveruse && totalCount <= 1) continue;

    matches.forEach((match, i) => {
      issues.push({
        ruleId: rule.id,
        ruleType: rule.rule_type,
        severity: rule.severity,
        scope: rule.scope,
        banned: rule.banned_term!,
        preferred: rule.preferred_term,
        excerpt: match.excerpt,
        field,
        lineNumber: match.line,
        matchIndex: match.index,
        count: isOveruse ? totalCount : undefined,
        reason: rule.body,
      });
      // For overuse rules we only need one issue entry showing the count
      if (isOveruse && i === 0) return;
    });
  }
  return issues;
}

export function useGuardrailScan(input: {
  title?: string;
  description?: string;
  body?: string;
  faqs?: { q: string; a: string }[];
}): ScanResult {
  const { data: rules = [], isLoading } = useLanguageGuardrails({ includeInactive: false });

  return useMemo(() => {
    const issues: ScanIssue[] = [
      ...scanField('title', input.title ?? '', rules),
      ...scanField('description', input.description ?? '', rules),
      ...scanField('body', input.body ?? '', rules),
      ...(input.faqs ?? []).flatMap((f) => [
        ...scanField('faq', f.q ?? '', rules),
        ...scanField('faq', f.a ?? '', rules),
      ]),
    ];

    // De-dupe overuse rules: keep only first per ruleId
    const seen = new Set<string>();
    const filtered: ScanIssue[] = [];
    for (const issue of issues) {
      if (issue.ruleType === 'tone') {
        const key = `${issue.ruleId}:${issue.field}`;
        if (seen.has(key)) continue;
        seen.add(key);
      }
      filtered.push(issue);
    }

    const hardCount = filtered.filter((i) => i.severity === 'hard').length;
    const softCount = filtered.filter((i) => i.severity === 'soft').length;
    return { issues: filtered, hardCount, softCount, isLoading };
  }, [rules, input.title, input.description, input.body, input.faqs, isLoading]);
}
