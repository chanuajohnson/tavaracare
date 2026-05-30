## Problem

Editing a guardrail at `/admin/language-guardrails` fails with:
> new row violates row-level security policy for table "language_guardrails"

## Root cause

`useUpsertGuardrail` in `src/hooks/admin/useLanguageGuardrails.ts` calls `supabase.from('language_guardrails').upsert(payload)`. PostgREST translates `.upsert()` into `INSERT ... ON CONFLICT DO UPDATE`, so Postgres always evaluates the **INSERT WITH CHECK** policy — even when the row already exists and only an UPDATE is happening.

The current INSERT policy requires `has_role(auth.uid(), 'admin')`. Whenever the WITH CHECK evaluation returns false (e.g. the admin session check momentarily fails, the user is editing under a non-admin role, or auth.uid() context isn't where the policy expects), the whole upsert is rejected — even for a pure edit.

The UPDATE policy on its own is fine (`USING has_role(...)`), so doing a plain `.update().eq('id', ...)` for edits avoids the INSERT-policy path entirely.

## Fix

In `src/hooks/admin/useLanguageGuardrails.ts`, change `useUpsertGuardrail` so:

- If `input.id` is present → `supabase.from('language_guardrails').update(payload).eq('id', input.id).select().single()` (only UPDATE policy runs).
- If `input.id` is absent → `supabase.from('language_guardrails').insert(payload).select().single()` (only INSERT policy runs).

Keep the same `created_by` / `updated_by` audit fields and the same `onSuccess` / `onError` toast behavior. No other call sites or UI change.

No DB migration is needed — the existing policies are correct for the split path.

## Verification

1. Log in as admin, edit the "patient → loved one" rule, change the body, click Save → toast "Guardrail saved", row updates, audit entry written.
2. Create a brand-new word rule → still works via the insert branch.
3. Toggle a rule on/off → unchanged (already uses `.update()`).
