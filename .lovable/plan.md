

## Plan: Add Administration History to Family Medications Tab + Fix Role Detection

### Problem
The family's Medications tab shows medications with adherence percentages but **no administration history**. When Tricia Cumm (professional) marks a medication as administered, the family user has no way to see that record — no log of who gave what medication and when.

Additionally, Tricia's administration was recorded with `administered_by_role: family` instead of `professional`, indicating a role detection bug.

### Changes

**File 1: `src/components/care-plan/MedicationsTab.tsx`**
- Add an expandable "Recent Activity" section below each medication showing the last 3-5 administrations
- Each entry displays: medication name, date/time, administered by (name), role badge (Family/Professional), status
- Alternatively, add a dedicated "Administration History" card at the bottom showing all recent administrations across all medications, sorted by date

**File 2: `src/components/medication/ConflictAwareAdministrationForm.tsx`**
- Fix the role detection: look up the current user's `role` from their profile instead of defaulting or guessing
- Ensure professionals are recorded as `professional` and family members as `family`

### What the family will see after this fix
- Each medication card will have a small "Last administered" line showing the most recent administration (e.g., "Apr 11, 2026 at 8:00 AM by Tricia Cumm (Professional)")
- A "Recent Administration Log" card showing a timeline of all recent medication administrations across the care plan, so the family can verify what was given and by whom

### Files Modified

| File | Change |
|------|--------|
| `src/components/care-plan/MedicationsTab.tsx` | Add administration history display showing who administered each medication and when |
| `src/components/medication/ConflictAwareAdministrationForm.tsx` | Fix role detection to correctly record professional vs family role |

