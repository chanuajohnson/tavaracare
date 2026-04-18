

## Diagnosis: Why Tricia's Peltier payments don't show

### What the database confirms ✅
- **Tricia Cumm** (id `56922ef7…`) IS an active caregiver on **Peltier's Care Plan 2025** (care_plan_id `4848aec5…`, family Chanua Johnson)
- **4 payroll entries** exist for her on that plan, totalling **$1,160** (all `pending`, none `paid` yet)
- **RLS allows** caregivers to read their own payroll entries via the `Caregivers can view their own payroll entries` policy
- **Care team membership** is correctly linked

### So why does the tab show empty? Two real causes

**Cause 1 — wrong care plan selected (most likely, based on your earlier screenshot)**
On her Profile Hub, Tricia has **two** active assignments:
1. Peltier's Care Plan 2025 (4 payments, the one you paid into)
2. Another plan (id `3d634783…`)

If the dropdown defaults to or has the OTHER plan selected, the Care Payments tab correctly shows "No care payments yet for this care plan" — because the query is scoped to the selected plan. The screenshot you shared earlier showed "Care plan for Mum / Ana Maria Aimey" selected, not Peltier — that's why it was empty.

**Cause 2 — fragile embedded join in the query (real bug, lower probability)**
`ProfessionalPayrollView.tsx` (line 48-59) uses a nested PostgREST join:
```
care_team_members:care_team_member_id ( caregiver_id, profiles!caregiver_id ( full_name ) )
```
If PostgREST can't resolve the inner `profiles!caregiver_id` relationship at runtime (foreign-key alias mismatch), the whole query throws and the catch block silently sets `entries = []` → empty tab. We don't actually need the joined name for caregiver self-view (it's always "You" anyway, line 78).

### Also worth noting
- All 4 of Tricia's entries are `payment_status = 'pending'` — so even when she finds the right plan, none will show "Paid" yet. If you marked it paid via bank transfer on the family side, that should have flipped them to `paid`. Worth checking that the bank-transfer flow actually wrote `payment_status = 'paid'`.

### Plan — 3 small fixes to make this bulletproof

**1. Add a "care plan switcher hint" to the empty state** in `ProfessionalPayrollView.tsx`
When `entries.length === 0` AND the caregiver has multiple active care plans, show:
> *"No care payments yet for this care plan. You have payments on **N other care plan(s)** — switch using the Care Plan selector above."*

This eliminates the "I paid her, why doesn't she see it?" confusion forever.

**2. Simplify the query — remove the fragile nested profile join**
Since caregiver self-view always labels rows as "You", drop the `profiles!caregiver_id` sub-select entirely:
```ts
.select('*')
.eq('care_plan_id', carePlanId)
.in('care_team_member_id', memberIds)
```
Removes any risk of silent join failure. Keep the `caregiver_name = "You"` default.

**3. Add a debug log + visible error state** so future "missing data" reports are diagnosable: if the query throws, show *"Couldn't load payments — please refresh"* instead of silently showing empty.

### Files touched (3 total)
1. `src/components/professional/profile/ProfessionalPayrollView.tsx` — simplify query, add multi-plan hint, add error state
2. *(verify only — no edit)* family-side bank-transfer flow updates `payment_status='paid'` correctly. If you confirm Tricia's 4 entries are still `pending` after you "marked paid", I'll dig there next loop.

### What stays the same
- ✅ All RLS policies (working correctly)
- ✅ Care plan selector / tab structure
- ✅ Receipt download, read-only mode, table behavior
- ✅ Family-side payments tab

### Out of scope
- Cross-care-plan rollup view (separate feature)
- Notification badge "you have a new payment" (separate feature)

### Action you can take RIGHT NOW (before code changes)
On Tricia's profile hub, open the **Care Plan selector** dropdown above the tabs and switch from "Care plan for Mum" to **"Peltier's Care Plan 2025"**. The 4 entries should appear immediately. If they still don't, tell me and I'll dig into Cause 2 / RLS.

