

## Plan: Fix Medication Administration Error + Add Meds & Emergency Contacts to Family Onboarding

### Two Issues to Fix

---

### Issue 1: "Failed to record some administrations" — `Invalid time value` Error

**Root Cause**: The Coveram medication has a `schedule.times` array where each element is an **object** (`{time: "08:00", beforeBed: false, withFood: true}`) instead of a plain string. The code at line 117-143 of `MedicationScheduleView.tsx` iterates `med.schedule.times` and treats each entry as a string, resulting in:
- `[object Object]` displayed in the UI (visible in the screenshot)
- `new Date("2026-04-11T[object Object]")` produces an Invalid Date
- Calling `.toISOString()` on Invalid Date throws `RangeError: Invalid time value`

**Fix in `MedicationScheduleView.tsx`** (lines 116-143):
- When iterating `med.schedule.times`, detect whether each element is a string or an object
- If object, extract `element.time` as the actual time string
- Also extract `withFood`/`beforeBed` flags to append to instructions display

```typescript
med.schedule.times.forEach((timeEntry: any) => {
  const time = typeof timeEntry === 'object' && timeEntry !== null 
    ? String(timeEntry.time || '08:00') 
    : String(timeEntry);
  // ... rest of dose creation using `time`
});
```

---

### Issue 2: Family Onboarding Checklist — Add Medication Confirmation & Emergency Contacts

**What the user wants**: On the family's onboarding checklist page, add two new sections that pull **live data** for the family to review and check off:

1. **Medication Confirmation Section** — Lists all medications from the family's care plan(s) with name, dosage, frequency, and instructions so the family can review and confirm each one
2. **Emergency Contact Details** — Shows emergency contacts on file for the family to verify and confirm

**Implementation**:

**File: `src/pages/family/FamilyOnboardingChecklistPage.tsx`**
- After loading the checklist, also fetch the family's care plans and their medications from `care_plans` + `medications` tables
- Also fetch emergency contacts from the family profile (`profiles` table — fields like `emergency_contact_name`, `emergency_contact_phone`) or from a dedicated emergency contacts source
- Render a **"Confirm Medications"** card within the checklist that lists each medication with name, dosage, schedule, and instructions, with a checkbox for the family to confirm they've reviewed it
- Render a **"Confirm Emergency Contacts"** card showing contact details with a checkbox for confirmation
- Save confirmation state to `checked_items` in the `onboarding_checklists` table (e.g., keys like `med_confirm_{medId}`, `emergency_contacts_confirmed`)

**File: `src/components/admin/onboarding/onboardingSections.ts`**
- Add a new section definition for "Medication Confirmation" with appropriate icon and description
- Add a new section definition for "Emergency Contact Verification"

---

### Files Modified

| File | Change |
|------|--------|
| `src/components/medication/MedicationScheduleView.tsx` | Fix `times` array handling to support object entries (`{time, withFood, beforeBed}`) instead of only strings |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Add live Medication Confirmation and Emergency Contact sections with data fetched from care plans |
| `src/components/admin/onboarding/onboardingSections.ts` | Add section definitions for medication confirmation and emergency contacts |

