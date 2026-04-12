## Plan: Auto-Sync Dates and Mirror Care Plan/Meds for Professionals

### Problem

1. .
2. **Care plan & medications not visible to professional**: The assigned professional needs to see the family's care plan details and medication list in their onboarding checklist, since they must document administering meds daily. Currently no care plan or medication data is shown on the professional onboarding page.

### Changes

**File 1**: `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx`

1. &nbsp;
2. &nbsp;
3. **Add Care Plan & Medications reference cards**: In the post_onboarding section (or a new dedicated section), render:
  - A "Your Assigned Care Plan" card showing: care plan title, care types, schedule, and key details from the family's care plan
  - A "Medications to Administer" card showing: medication name, dosage, frequency, schedule — read-only reference so the professional knows what to document daily
  - Both cards are read-only informational displays
4. &nbsp;

**File 2**: Database — RLS policy needed

The professional needs SELECT access to `care_plans` and `medications` for families they are assigned to. This requires:

- A new RLS policy on `care_plans`: allow SELECT where the professional is a member of the care team (`care_team_members` table) 
- A new RLS policy on `medications`: same pattern

Alternatively, if `care_team_members` already links them, existing policies may suffice. Will verify and add policies only if needed.

### Technical Details

```text
Professional Onboarding Page Data Flow:
┌──────────────────────────────────────┐
│ professional_onboarding_checklists   │
│ → checked_items.assigned_family_id ──┼──┐
└──────────────────────────────────────┘  │
                                          ▼
┌──────────────────────────────────────┐
│ onboarding_checklists (family)       │
│ → post_onboarding_1_date (Intro)     │
│ → post_onboarding_2_date (Meeting)   │
│ → post_onboarding_3_date (Start)     │
└──────────────────────────────────────┘
                                          
┌──────────────────────────────────────┐
│ care_plans (where family_id = X)     │
│ → title, care_types, schedule        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ medications (where care_plan_id)     │
│ → name, dosage, frequency, schedule  │
└──────────────────────────────────────┘
```

### Files Modified


| File                                                             | Change                                                                                                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` | Fetch linked family dates + care plan + medications; render date badges from family; add Care Plan and Medications reference cards |
| **Migration** (new SQL)                                          | Add RLS SELECT policies on `care_plans` and `medications` for assigned professionals (if not already covered)                      |
