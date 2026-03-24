

## Add Professional Family Match Notification Banner

### Problem
1. **No match notification banner exists for professionals** -- The family dashboard has `FamilyMatchNotification` ("You have 1 caregiver match!") but there's no equivalent on the professional dashboard. The `ProfessionalFamilyAwarenessBanner` only shows "X families actively looking" — and it returns 0 because both available families already have active assignments (the RPC filters those out).

2. **Current data for chanuajohnson6@gmail.com**: This professional has 5 active family assignments (Chan Johnson, Lana Rivera, Kwame Johnson, Carl Giveet, Sarina Bland). They ARE matched — there's just no banner showing it.

3. **Awareness banner logic is too restrictive**: `get_unmatched_family_count()` excludes families with ANY active assignment. Both available families (Ana Maria Aimey, Sarina Bland) have assignments, so count = 0 and the banner hides.

### Changes

#### 1. Create `ProfessionalFamilyMatchNotification` component
**New file: `src/components/professional/ProfessionalFamilyMatchNotification.tsx`**

Mirror `FamilyMatchNotification` style (emerald gradient, left border, dismiss button):
- Query `caregiver_assignments` where `caregiver_id = user.id` and `is_active = true`
- Show: "You have X family matches!" with family names
- "View your matches" link goes to the family matches section or `/urgent-families`
- Dismissible with X button

#### 2. Update awareness banner RPC to count available families (not just unmatched)
**Database migration**: Update `get_unmatched_family_count()` to show families that are `available_for_matching = true` regardless of whether they already have some assignments. Rename concept from "unmatched" to "available":

```sql
CREATE OR REPLACE FUNCTION public.get_unmatched_family_count()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer
  FROM profiles p
  WHERE p.role = 'family'
    AND p.available_for_matching = true;
$$;
```

This way the awareness banner shows "2 families are actively looking" even if they have some assignments.

#### 3. Add the match notification to the professional dashboard
**Modify: `src/pages/dashboards/ProfessionalDashboard.tsx`**

Add `ProfessionalFamilyMatchNotification` above the existing awareness banners (same position as `FamilyMatchNotification` on the family dashboard).

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Create | `src/components/professional/ProfessionalFamilyMatchNotification.tsx` | Match notification banner mirroring family dashboard style |
| Migrate | Database | Update `get_unmatched_family_count()` to count all available families, not just unassigned ones |
| Modify | `src/pages/dashboards/ProfessionalDashboard.tsx` | Add `ProfessionalFamilyMatchNotification` to banner section |

