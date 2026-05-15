# Lock down Ana Maria Aimey (and any "limited" family) to true read-only

## Problem
Today, setting a family to `account_status='limited'` only:
- Shows a yellow `LimitedAccessBanner` on the family dashboard
- Sets `available_for_matching=false`

It does **not** stop her from editing or deleting anything. `useAccountStatus().isReadOnly` is read in exactly one file (the banner). Every form, button, and Supabase mutation still works because RLS policies don't check account status.

She can still: edit her care plan, edit/delete care shifts, edit/delete medications + admin logs, edit meal plans + grocery lists, send chat messages to professionals, edit her own profile, claim/request shift coverage, edit care team members.

## Fix — two layers

### Layer 1 — Database (the real guarantee)
Add a security-definer helper and **RESTRICTIVE** RLS policies on every table a family can write to. Restrictive policies AND with existing permissive ones, so we add a single "deny if limited" rule per table without touching existing policies. SELECT stays unaffected — only INSERT / UPDATE / DELETE are blocked.

```sql
create or replace function public.is_account_limited(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = _uid and account_status in ('limited','free_only','banned','deleted')
  )
$$;
```

Tables receiving a restrictive `FOR INSERT/UPDATE/DELETE` policy `(NOT public.is_account_limited(auth.uid()))`:
- `profiles` (she can't edit her own profile)
- `care_plans`, `care_plan_edit_log`
- `care_shifts`, `shift_coverage_requests`, `shift_coverage_claims`, `shift_notifications`
- `care_team_members`, `employer_settings`
- `medications`, `medication_administrations`
- `meal_plans`, `meal_plan_items`, `grocery_lists`, `grocery_items`, `recipes`
- `family_chat_messages`, `family_chat_requests`, `family_chat_sessions`
- `work_logs`, `work_log_expenses`, `payroll_entries` (families shouldn't write these anyway, but defense-in-depth)

Admin actions are unaffected because admins act through their own `auth.uid()` (status='active').

`family_payment_records` is admin-managed, no change needed.

### Layer 2 — UI (clarity, never let user feel stuck)
Add a small `useReadOnlyGuard()` hook + `<ReadOnlyOverlay>` that:
- Disables and dims action buttons (Edit / Delete / Save / Send / Add) inside family dashboard pages when `isReadOnly` is true
- Shows a tooltip: "Read-only mode — contact your coordinator to make changes"
- Wraps form submit handlers so they short-circuit with a toast instead of hitting Supabase

Apply guard in the family-mutating components: care plan editor, shifts editor, medications page, meal plans page, professional chat composer, profile edit, care team management. Leaves all read views fully visible (in line with "never let the user feel stuck" — she can still see everything, just not change it).

The existing `LimitedAccessBanner` stays as the top-of-page explanation.

## Out of scope
- No changes to admin tools, payment ledger, routing, or registration files.
- No change to `free_only` UX (already handled separately) — but the DB function does include it as a safety net.

## Verification
1. Sign in as Ana → confirm Edit/Delete buttons are disabled with tooltip across her dashboard.
2. Try a direct Supabase call from console as Ana → expect `new row violates row-level security policy`.
3. Sign in as admin → confirm full edit/delete still works on Ana's records.
4. Restore Ana to `active` → confirm full write access returns.

## Technical notes
- One migration: helper function + ~20 restrictive policies (idempotent `drop policy if exists` first).
- One new file `src/hooks/useReadOnlyGuard.ts`.
- Touch ~8 family components to wire the guard around mutation buttons / submit handlers.
