

## Fix: Urgent Families Page Blocked by RLS

### Problem
The `/urgent-families` page shows "No Urgent Requests Right Now" despite two families (Ana Maria Aimey, Sarina Bland) being marked `available_for_matching = true` in admin.

**Root cause**: The `profiles` table RLS has a policy "Public can view spotlight caregiver profiles" that allows public access to caregivers via the `caregiver_spotlight` table. But there is **no equivalent policy for family profiles**. Anonymous and non-admin users are blocked from reading any family profile rows.

### Fix

#### 1. Add RLS policy for public family visibility
Create a new RLS SELECT policy on `profiles` that allows anyone to view family profiles where `available_for_matching = true`, but **only expose non-sensitive columns** via a security definer function (not direct table access).

**Option A (simple policy):** Add a SELECT policy:
```sql
CREATE POLICY "Public can view available family profiles"
ON public.profiles
FOR SELECT
USING (
  role = 'family' 
  AND available_for_matching = true
);
```

However, this exposes ALL columns (phone, address, etc.) to the public, which is a privacy risk.

**Option B (recommended — security definer function):** Create an RPC function that returns only safe columns, similar to `get_public_professional_profiles`:

```sql
CREATE OR REPLACE FUNCTION public.get_public_family_profiles()
RETURNS TABLE(
  id uuid,
  full_name text,
  location text,
  care_types text[],
  care_urgency care_urgency,
  care_schedule text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.full_name, p.location, p.care_types, p.care_urgency, p.care_schedule
  FROM profiles p
  WHERE p.role = 'family'
    AND p.available_for_matching = true
  ORDER BY p.updated_at DESC;
$$;
```

#### 2. Update UrgentFamiliesPage.tsx to use the RPC
Change the query from `supabase.from("profiles").select(...)` to `supabase.rpc("get_public_family_profiles")`.

This mirrors the pattern used for caregiver spotlight data and ensures only safe, non-PII columns are returned.

### Answer to Ana Maria's question
Carol Glenn-Aimey has **high blood pressure** with an **aspirin allergy**. Care needs include medication management (assistance with feeding and medication), vitals checks, housekeeping (tidy room, laundry), and meal prep.

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | Database | Create `get_public_family_profiles()` security definer function |
| Modify | `src/pages/UrgentFamiliesPage.tsx` | Switch from direct table query to `supabase.rpc("get_public_family_profiles")` |

