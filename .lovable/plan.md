

## Plan: Update SOP Checklist + NIS Clarity + Meal Prep Responsibility

### 3 changes:

---

### 1. Add "Take out trash" to Home Tasks (SOP checklist)

**File**: `src/components/professional/checklist/checklistSections.ts`

Add `'Take out trash'` to the Home Tasks section items, after "Laundry support".

---

### 2. Clarify meal prep responsibility on both sides

**Professional SOP** (`checklistSections.ts`): Change `'Prepare nutritious meals'` to `'Light cooking of pre-prepared meals (family provides meal prep and ingredients)'`

**Family onboarding** (`onboardingSections.ts`): In the medication/meal section, add or update the meal-related item to clarify: `"Meal preparation is the family's responsibility — caregiver performs light cooking of pre-prepared meals provided by the family"`

**Professional onboarding** (`professionalOnboardingSections.ts`): In the `medication_meal_protocols` section, update `'Meal plan access — weekly schedules and dietary notes'` to `'Meal plan access — caregiver performs light cooking of pre-prepared meals; family is responsible for meal prep and ingredients'`

---

### 3. Update NIS wording for clarity (both family and professional sides)

**Family T&C** (`onboardingSections.ts` line 208): Change to:
`"Family acknowledges that Tavara handles all employer aspects of NIS (National Insurance) contributions for the caregiver, as long as the family maintains their care subscription"`

**Family post-onboarding** (line 226): Change to:
`"NIS (National Insurance) — Tavara handles all employer NIS obligations for the assigned nurse while the family subscription is active"`

**Professional T&C** (`professionalOnboardingSections.ts` line 148): Change to:
`"Professional acknowledges NIS contributions are handled by Tavara as the employer of record"`

**Professional post-onboarding** (line 164): Change to:
`"NIS contributions handled by Tavara as employer of record"`

---

### Files Modified

| File | Change |
|------|--------|
| `src/components/professional/checklist/checklistSections.ts` | Add "Take out trash"; update meal item to "Light cooking of pre-prepared meals" |
| `src/components/admin/onboarding/onboardingSections.ts` | Update NIS wording (2 places); add meal prep responsibility note |
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | Update NIS wording (2 places); update meal protocol item |

