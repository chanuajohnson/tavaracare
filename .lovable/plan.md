

## Fix: Professional Dashboard Mock Data, Location on Urgent Families, and Confusing Matches

### Three Issues

1. **Professional dashboard shows mock "Wilson"/"Garcia" families** — `useFamilyMatches` queries ALL family profiles without `available_for_matching` filter, and falls back to hardcoded MOCK_FAMILIES when RLS blocks the query. The "View All Family Matches" modal (`ProfessionalFamilyMatchModal`) also uses this same hook with mock data.

2. **`/urgent-families` cards show "Family in Trinidad & Tobago" instead of a general area** — `profiles.location` is null for these families. The actual address is in `care_needs_family.care_location` (e.g., "199 Monica Drive, Block 4, Palmiste, San Fernando"). The RPC needs to pull the general area from `care_location` as a fallback, stripping the street address for privacy.

3. **Journey step "Match with Tavara Families" → "View Family Matches" button** scrolls to DashboardFamilyMatches which shows mock Wilson data, and "View All Family Matches" opens ProfessionalFamilyMatchModal which shows mock Garcia data — confusing and inaccurate.

### Changes

#### 1. Update `get_public_family_profiles` RPC to return general area from care_location
**Database migration** — Join `care_needs_family.care_location`, extract last 2 comma-separated parts (general area only, no street address):

```sql
CREATE OR REPLACE FUNCTION public.get_public_family_profiles()
RETURNS TABLE(
  id uuid, full_name text, location text, care_types text[],
  care_urgency care_urgency, care_schedule text,
  diagnosed_conditions text, chronic_illness_type text
) AS $$
  SELECT p.id, p.full_name, 
    COALESCE(p.location, 
      -- Extract general area from care_location (last 2 parts)
      (SELECT string_agg(part, ', ') FROM (
        SELECT unnest(
          (string_to_array(cn.care_location, ','))[
            array_length(string_to_array(cn.care_location, ','), 1) - 1 :
          ]
        ) AS part
      ) sub)
    ) as location,
    p.care_types, p.care_urgency, p.care_schedule,
    cn.diagnosed_conditions, cn.chronic_illness_type
  FROM profiles p
  LEFT JOIN care_needs_family cn ON cn.profile_id = p.id
  WHERE p.role = 'family' AND p.available_for_matching = true
  ORDER BY p.updated_at DESC;
$$;
```

This ensures cards show "Palmiste, San Fernando" instead of "Trinidad & Tobago" or the full street address.

#### 2. Fix `useFamilyMatches` to filter by `available_for_matching` and remove mock data
**File: `src/hooks/useFamilyMatches.ts`**

- Remove `MOCK_FAMILIES` array entirely (Garcia, Wilson, Thomas)
- Add `.eq('available_for_matching', true)` to the family profiles query (line 222)
- When no families found or query errors, show empty state instead of mock data
- When falling back, set empty array instead of mock families
- Also add `full_name` privacy: show only initials-based display name on the Family interface

#### 3. Update `DashboardFamilyMatches` empty state
**File: `src/components/professional/DashboardFamilyMatches.tsx`**

- Update the empty state to say "No families available right now" with a link to `/urgent-families` instead of showing filter adjustment button
- This is more helpful since the real data comes from admin availability toggles

#### 4. Update `ProfessionalFamilyMatchModal` empty state
**File: `src/components/professional/ProfessionalFamilyMatchModal.tsx`**

- Same empty state update — link to `/urgent-families` when no matches

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | Database | Update `get_public_family_profiles()` to extract general area from `care_location` as fallback |
| Modify | `src/hooks/useFamilyMatches.ts` | Remove mock families, add `available_for_matching` filter, empty state on no data |
| Modify | `src/components/professional/DashboardFamilyMatches.tsx` | Update empty state messaging |
| Modify | `src/components/professional/ProfessionalFamilyMatchModal.tsx` | Update empty state messaging |

