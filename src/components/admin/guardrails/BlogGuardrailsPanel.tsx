import { useLanguageGuardrails } from '@/hooks/admin/useLanguageGuardrails';

export function BlogGuardrailsPanel() {
  const { data: rules = [] } = useLanguageGuardrails();

  const words = rules.filter((r) => r.rule_type === 'word');
  const allow = rules.filter((r) => r.rule_type === 'financial_allow');
  const deny = rules.filter((r) => r.rule_type === 'financial_deny');
  const tone = rules.filter((r) => r.rule_type === 'tone');

  return (
    <details className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
      <summary className="cursor-pointer font-semibold text-amber-900">
        Tavara language guardrails (click to expand — read before writing)
      </summary>
      <div className="mt-2 space-y-2 text-amber-950">
        <p className="font-medium">
          Tavara is a care coordination platform — never an agency, staffing company, or
          Uber-for-caregivers. We sell continuity and coordination, not caregiver hours.
        </p>

        {words.length > 0 && (
          <>
            <p className="font-medium">Banned → use instead:</p>
            <ul className="list-disc pl-5 text-xs leading-relaxed">
              {words.map((w) => (
                <li key={w.id}><b>{w.banned_term}</b> → {w.preferred_term}</li>
              ))}
            </ul>
          </>
        )}

        {(allow.length > 0 || deny.length > 0) && (
          <>
            <p className="font-medium pt-1">Financial privacy on public copy:</p>
            {allow.length > 0 && (
              <p className="text-xs leading-relaxed"><b>OK to mention:</b> {allow.map((r) => r.body).join(' ')}</p>
            )}
            {deny.length > 0 && (
              <p className="text-xs leading-relaxed"><b>NEVER public:</b> {deny.map((r) => r.body).join(' ')}</p>
            )}
          </>
        )}

        {tone.length > 0 && (
          <ul className="list-disc pl-5 text-xs leading-relaxed pt-1">
            {tone.map((t) => <li key={t.id}>{t.body}</li>)}
          </ul>
        )}

        <p className="text-xs">
          Manage these rules at <a className="underline" href="/admin/language-guardrails">/admin/language-guardrails</a>.
        </p>
      </div>
    </details>
  );
}
