

## Plan: Hide Scheduling Banner for Families with Active Care + Remove Old Pricing

### Problem
The family dashboard for `chanuajohnson@gmail.com` shows:
1. **An orange "Next Step: Schedule Your Care" banner** with outdated pricing ($320 TTD / $40/hr) — even though this family already has assigned caregivers, an active care plan, and a chosen care model
2. The `SchedulingStatusBanner` only checks if `hasMatches` is true and if there's a `visitDetails` record. It does **not** check whether caregivers are already assigned or care has begun

### Root Cause
In `FamilyDashboard.tsx` (line 42-43), `hasMatches` is derived from step 7 completion. The banner shows the amber CTA whenever `hasMatches=true` and `visitDetails` is null/cancelled. It never checks steps 9-11 (caregiver assigned, meeting, care begins).

### Changes

| File | Change |
|------|--------|
| `src/components/family/FamilyDashboard.tsx` | Add a check for caregiver assignment (step 9) and care model chosen (step 15). If either is complete, hide the scheduling banner entirely by setting `hasMatches=false` or adding a `hasCaregiverAssigned` flag that suppresses the banner. |
| `src/components/family/SchedulingStatusBanner.tsx` | Add `hasCaregiverAssigned` prop. Return `null` when true — the family is past the scheduling phase. Also update the amber banner text to remove the "$320 TTD" and "$40/hr" pricing references, replacing with subscription-aligned language. |

### Updated Banner Logic
```text
SchedulingStatusBanner visibility:
  - hasMatches=false → hidden
  - hasCaregiverAssigned=true → hidden (NEW)
  - visitDetails exists & not cancelled → green "scheduled" banner
  - otherwise → amber CTA (with updated text, no old pricing)
```

### Updated Amber Banner Text
- Title: "Next Step: Schedule Your Care" (unchanged)
- Description: "You have matched caregivers ready! Schedule a visit with our care coordinators to get started."
- Button: "Get Started with Care" (unchanged)

### Result
- Families with active care teams no longer see the misleading orange scheduling banner
- The outdated $320 TTD / $40/hr pricing is removed from the last place it appears in the family-facing UI

