# Fix Denise's Daily Checklist Saves — Final Plan

## Why this is happening (confirmed via DB inspection)

Denise's `care_team_members` row for the Aimey care plan has `family_id` pointing at **Chanua (admin)** instead of **Ana Maria Aimey**. This causes:
- `get_professional_accessible_family_profiles(denise.id)` to return Chanua instead of Ana Maria.
- Denise's "Client" dropdown in `DailyChecklist` to show an admin instead of the family.
- `handleSave` to silently `return` when the selected shift can't be matched against `availableShifts` for the actual care plan → Save button looks frozen, no toast, no error.

Tricia's row is correct, which is why her saves persist end-to-end (including with the orange banner in place — so the banner is **not** the cause of Denise's failures, but you've asked to remove it anyway).

Successful logs from Denise on Apr 15–17 used the **"Other (ad-hoc shift)"** path, which bypasses assignment/shift validation. From Apr 18 onward she attempted the scheduled path and hit the silent-failure branch.

---

## Step 1 — Data repair (Supabase, two precise statements; NOT a global sweep)

**1a. Fix Denise's row only**
```sql
UPDATE care_team_members
SET family_id = '9874b53e-ea23-4ccb-abed-ddbb0367edf5',  -- Ana Maria Aimey
    updated_at = now()
WHERE id = '2acc673b-e572-4f55-8677-b25530d2cd73'
  AND caregiver_id = '24fe4121-89e6-4a3a-ba9c-c56e768afc05'  -- Denise
  AND care_plan_id  = '3d634783-c041-476d-8360-2980846a39e4'; -- Aimey plan
```

**1b. Add Chanua as admin coordinator on the Aimey plan (per your request to remain visibly attached)**
```sql
INSERT INTO care_team_members (
  care_plan_id, family_id, caregiver_id, role, status, display_name, notes
) VALUES (
  '3d634783-c041-476d-8360-2980846a39e4',  -- Aimey plan
  '9874b53e-ea23-4ccb-abed-ddbb0367edf5',  -- Ana Maria (correct family link)
  '6d089663-8794-444e-99fa-ae480d3f3c35',  -- Chanua (admin)
  'other',
  'active',
  'Chanua Johnson — Care Coordinator (Admin)',
  'Tavara admin coordinator attached for oversight; not a billable caregiver.'
);
```

This keeps you visibly attached to the plan **without** stealing the family slot from Ana Maria. Your `/admin/...` coordination path is unaffected — it never relied on this row.

---

## Step 2 — Code change: `src/components/professional/DailyChecklist.tsx` (only file touched)

1. **Remove the orange banner**
   - Remove the `import { UnsavedChangesBanner } from './UnsavedChangesBanner'` (or equivalent) and its render block.
   - Bottom Save / Save & Send buttons remain the single source of truth.

2. **Replace silent `return` paths in `handleSave` with a persistent inline red error bar via `setSaveError(...)`**
   - `assignments.length === 0` → "We couldn't find any care plans assigned to you. Please contact Tavara support."
   - selected shift = `__other__` but no notes → "Please add a quick note describing today's shift before saving."
   - selected shift not found in `availableShifts` → "Please pick a shift from the list, or choose 'Other (ad-hoc shift)'."
   - Supabase insert error → surface the actual error message returned from Supabase.

3. **Add an amber inline notice under the Client dropdown** when `assignments.length === 0`:
   - Tells the caregiver to use "Other (ad-hoc shift)" or contact Tavara, so future data mismatches surface immediately instead of looking like a frozen button.

No other files, no routing, no auth, no providers, no RPC, no `useCurrentAssignments` change.

---

## Step 3 — Read-only audit query (printed for you, not auto-run)

```sql
SELECT ctm.id, pc.full_name AS caregiver, pf.full_name AS ctm_family,
       pf.role AS ctm_family_role, pcp.full_name AS plan_family, cp.title
FROM care_team_members ctm
JOIN care_plans cp  ON cp.id  = ctm.care_plan_id
LEFT JOIN profiles pc  ON pc.id  = ctm.caregiver_id
LEFT JOIN profiles pf  ON pf.id  = ctm.family_id
LEFT JOIN profiles pcp ON pcp.id = cp.family_id
WHERE ctm.family_id <> cp.family_id
  AND ctm.status = 'active';
```

Run from `/admin` whenever you want to spot future mismatches. We will NOT auto-sweep.

---

## Guardrails honored (will NOT touch)

- `src/App.tsx`, routing, navigation, layout
- `AuthProvider`, Supabase client, query providers
- `src/pages/registration/FamilyRegistration.tsx`
- Chat flow files, registration flows, multi-select managers
- `get_professional_accessible_family_profiles` RPC (admin path stays exactly as-is)
- `useCurrentAssignments.ts` (no behavioral change needed once data is correct)
- Tricia's row, any other professional's row, any other care plan
- Stage4SupplyNudge / FamilyReadinessQuickAccess / family dashboard

---

## Expected outcome

- Denise's "Client" dropdown shows **Ana Maria Aimey** (correct).
- Her Apr 20–24 scheduled shifts appear; she can save against them and entries persist in `daily_care_logs` with checklist ticks, notes, timestamps.
- You (Chanua) remain visibly attached to the Aimey plan as "Care Coordinator (Admin)" and continue to administer everything from `/admin/...` exactly as today.
- Any future data mismatch (anyone) shows a visible red error bar + amber notice instead of a silent failure.
- Orange `UnsavedChangesBanner` is gone.