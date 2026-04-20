

## Plan: Fix "View all logs" modal showing empty for caregivers

### What's actually broken

The Recent Activity card (where you see Tricia's "Saved Daily Checklist" entries) loads correctly via `useProfessionalActivity(professionalId)` — that's why the feed on the right shows her logs.

But when you click **"View all logs"**, the modal renders:
```tsx
<AdminCareLogsTab userId={professionalId} />
```

Inside `AdminCareLogsTab` the very first query is:
```ts
supabase.from('care_plans').select('id').eq('family_id', userId)
```

It treats `userId` as a **family_id**. Tricia is a **professional**, not a family — so `care_plans` returns 0 rows → 0 medications → 0 logs → "No care logs or medication administrations found for this family."

That's the empty state in your second screenshot. The data exists (Recent Activity proves it), the modal is just querying the wrong column.

### The fix — one focused component

Create a new admin component dedicated to **per-professional** logs, and render that in the modal instead of `AdminCareLogsTab`.

**New file:** `src/components/admin/ProfessionalCareLogsList.tsx`

- Accepts `professionalId: string`
- Queries `daily_care_logs` filtered on `professional_id = professionalId` (last 90 days, ordered desc, limit 50)
- Resolves family/client names from `profiles` for display
- Reuses the same expandable layout pattern from `AdminCareLogsTab`:
  - Collapsed row: date · client name · shift type · checklist completion badge · time in–out
  - Expanded: full checklist breakdown using `CHECKLIST_SECTIONS` + nurse notes + `started_at` / `last_activity_at` timestamps
- Empty state copy: *"Tricia hasn't saved any daily care logs in the last 90 days."* (uses the actual professional name passed in)
- Loading skeleton + error state matching existing admin components

**Modified file:** `src/components/admin/ProfessionalActivityTab.tsx`

- Line 30: swap import → `ProfessionalCareLogsList`
- Line 359: render `<ProfessionalCareLogsList professionalId={professionalId} professionalName={professionalName} />` instead of `<AdminCareLogsTab userId={professionalId} />`

That's the entire change. No DB changes, no edge functions, no migrations.

### Why a new component (not "fix" `AdminCareLogsTab`)

`AdminCareLogsTab` is correctly designed for the **family detail view** — it pulls everything tied to one family (their care plans, their medications, all caregivers' logs on their plans). It's working correctly where it's used elsewhere. We just shouldn't reuse it in a professional context where the semantics flip from family-scoped to professional-scoped.

Keeping the two views separate avoids breaking the family-side admin views and keeps each query focused.

### What stays untouched

- `AdminCareLogsTab.tsx` — protected, used elsewhere on family admin views
- `useProfessionalActivity.ts` — already works correctly
- The Recent Activity feed itself — still shows Tricia's saves
- Compliance Summary, This Week's Shifts, refresh, all dialog plumbing
- No changes to routing, AuthProvider, registration, chat flow, or any guarded files

### Acceptance test

1. Admin → open Tricia Cumm's user detail → Activity tab
2. Recent Activity card shows her checklist saves (already works today)
3. Click **View all logs** → modal opens titled *"All Daily Care Logs — Tricia Cumm"*
4. Modal now lists every `daily_care_logs` row where `professional_id = Tricia.id` from the last 90 days, newest first
5. Each row shows date · client name · shift time · completion `X/Y` badge
6. Click a row → expands into full checklist breakdown + notes + `started_at` timestamp
7. Open a different professional with no logs → modal shows *"[Name] hasn't saved any daily care logs in the last 90 days."*
8. Family admin views (where `AdminCareLogsTab` is still used) — unchanged, still show family-scoped logs as before

