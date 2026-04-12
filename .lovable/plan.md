

## Plan: Filter MedicationDashboard by Selected Care Plan

### Problem

When the professional selects "Care for Mom" in the care plan selector, the Medications tab shows medications from **all** assigned care plans (including Peltier's Care Plan). The `MedicationDashboard` component ignores the `selectedCarePlanId` entirely — it fetches and displays medications for every care plan the professional is assigned to.

### Root Cause

1. In `CarePlanTabs.tsx` line 111: `<MedicationDashboard />` — no `carePlanId` prop is passed
2. In `MedicationDashboard.tsx`: the component calls `medicationService.getMedicationsForAssignedCarePlans(user.id)` which fetches ALL care plans' medications, not just the selected one

### Fix

**File 1: `src/components/professional/profile/CarePlanTabs.tsx`**

Pass `selectedCarePlanId` to `MedicationDashboard`:

```tsx
<MedicationDashboard carePlanId={selectedCarePlanId} />
```

**File 2: `src/components/professional/MedicationDashboard.tsx`**

- Add optional `carePlanId` prop
- When `carePlanId` is provided, use `medicationService.getMedicationsForCarePlan(carePlanId)` instead of loading all plans
- When no `carePlanId` is provided, fall back to current behavior (all assigned plans)
- Also display the care plan title instead of truncated UUID ("Care Plan: 4848aec5...")

### Files Modified

| File | Change |
|------|--------|
| `src/components/professional/profile/CarePlanTabs.tsx` | Pass `selectedCarePlanId` to `MedicationDashboard` |
| `src/components/professional/MedicationDashboard.tsx` | Accept `carePlanId` prop, filter medications to selected plan only |

