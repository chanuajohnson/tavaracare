

## Plan: Fix Weekly Hours to Use Only the Caregiver's Assigned Shift (40 hrs, not 56)

### Problem
The `CaregiverRateSelector` and `BillingSummaryCard` sum ALL shifts in the family's `care_schedule` field. Anna Maria's schedule is `mon_fri_8am_4pm,sat_sun_8am_4pm` which totals 56 hrs/wk. But her caregiver works Mon-Fri 8AM-4PM only — so the labor calculation should use **40 hours**, not 56.

The family's care schedule represents total coverage needed (potentially multiple caregivers). The rate selector should let the admin specify which shift applies to THIS caregiver's rate calculation.

### Solution
The simplest correct fix: let the admin **select which shift** the rate applies to, rather than auto-summing all shifts. When the family has multiple shifts, the selector should show each shift individually and let admin pick one (or override hours manually).

### File Changes

**1. `src/components/admin/onboarding/CaregiverRateSelector.tsx`**

- When `care_schedule` has multiple shifts, show a **shift selector dropdown** so admin picks which shift the rate applies to (e.g., "Mon-Fri 8AM-4PM — 40 hrs/wk")
- Default to the first/primary shift rather than summing all
- Add an optional manual hours override input for edge cases
- The selected shift's hours drive the weekly labor calculation
- Export the selected shift hours so `BillingSummaryCard` and `DocumentGenerationMenu` use the correct value

**2. `src/components/admin/onboarding/BillingSummaryCard.tsx`**

- Use the `weeklyHours` prop as-is (already accepts it) — the fix is in the value being passed from the checklist page

**3. `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

- Pass the correct per-shift hours (from the selected shift, not the total) to `BillingSummaryCard` and `DocumentGenerationMenu`

### Result for Anna Maria
- Shift selector defaults to "Mon-Fri 8AM-4PM"
- Weekly hours: **40 hrs** (not 56)
- Weekly labor: 40 × $35 = **$1,400/wk**
- Projected weekly total: $499 + $1,400 = **$1,899/wk**
- Projected monthly: ~$8,222/mo

### Files Modified
1. `src/components/admin/onboarding/CaregiverRateSelector.tsx` — Add shift selector for multi-shift schedules
2. `src/pages/admin/AdminOnboardingChecklistPage.tsx` — Pass per-shift hours instead of total

