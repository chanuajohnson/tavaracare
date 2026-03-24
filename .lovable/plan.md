

## Two Fixes: Add Medical Fields to Nudge System + Show Chronic Illness on Family Cards

### Problem
1. The smart nudge system (`UserNudgeTab.tsx`) only checks 2 care assessment fields (`cultural_preferences`, `additional_notes`). It ignores critical medical fields like `chronic_illness_type`, `diagnosed_conditions`, and `known_allergies` — which is why Ana Maria's missing chronic illness info was never flagged.
2. The `/urgent-families` cards show no medical context. Caregivers need to know if there's a chronic illness or if none was specified.

### Changes

#### 1. Add medical care assessment fields to nudge detection
**File: `src/components/admin/UserNudgeTab.tsx`** (lines 170-180)

Add checks for these care assessment fields in `getIncompleteFields()`:
- `chronic_illness_type` — "Chronic illness details"
- `diagnosed_conditions` — "Diagnosed conditions"
- `known_allergies` — "Known allergies"
- `emergency_plan` — "Emergency plan"
- `triggers_soothing_techniques` — "Triggers & soothing techniques"

These are all fields on the care assessment form that caregivers need to make informed decisions.

#### 2. Add chronic illness info to family cards
**File: `src/pages/UrgentFamiliesPage.tsx`**

- Update `get_public_family_profiles` RPC to also return a `chronic_illness_summary` field (or add a separate query to `care_needs_family` for non-PII medical fields)
- On each card, below the care type badges, show:
  - If chronic illness exists: a badge like "🏥 Diabetes" or "🏥 High blood pressure"
  - If null/empty: "🏥 No chronic illness specified"
- Same treatment for `diagnosed_conditions` — show it or show "No conditions specified"

**Database migration**: Update `get_public_family_profiles()` to join `care_needs_family` and return `diagnosed_conditions` and `chronic_illness_type` (these are medical, not PII).

Updated RPC:
```sql
CREATE OR REPLACE FUNCTION public.get_public_family_profiles()
RETURNS TABLE(
  id uuid, full_name text, location text, care_types text[],
  care_urgency care_urgency, care_schedule text,
  diagnosed_conditions text, chronic_illness_type text
)
AS $$
  SELECT p.id, p.full_name, p.location, p.care_types, p.care_urgency, p.care_schedule,
    cn.diagnosed_conditions, cn.chronic_illness_type
  FROM profiles p
  LEFT JOIN care_needs_family cn ON cn.profile_id = p.id
  WHERE p.role = 'family' AND p.available_for_matching = true
  ORDER BY p.updated_at DESC;
$$;
```

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | Database | Update `get_public_family_profiles()` to include `diagnosed_conditions` and `chronic_illness_type` |
| Modify | `src/components/admin/UserNudgeTab.tsx` | Add `chronic_illness_type`, `diagnosed_conditions`, `known_allergies`, `emergency_plan`, `triggers_soothing_techniques` to incomplete field checks |
| Modify | `src/pages/UrgentFamiliesPage.tsx` | Update interface and cards to show chronic illness / diagnosed conditions info |

