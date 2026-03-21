

## Fix: Professional Awareness Banners (RLS) + Harden Family Story Button

### Problem 1: Professional Banners — RLS blocks the query

The `ProfessionalFamilyAwarenessBanner` runs:
```sql
SELECT id FROM profiles WHERE role = 'family'
```
But professionals can only see their own profile row via RLS (`id = auth.uid()`). Result: 0 families → banner hidden.

**Fix**: Create a security definer RPC function that returns the count of unmatched families without exposing any PII. The banner calls this function instead of querying profiles directly.

### Problem 2: Family Story Button — likely stale preview, but hardening needed

The code logic is correct. DB confirms no `care_recipient_profiles` record for the logged-in family user. The button should show. This is likely a stale preview. However, to harden:
- Add explicit debug logging when `showStoryButton` is evaluated
- Ensure `careRecipient` defaults to `null` (not `undefined`) during loading

### Changes

#### 1. Migration: Create `get_unmatched_family_count()` RPC

```sql
CREATE OR REPLACE FUNCTION public.get_unmatched_family_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer
  FROM profiles p
  WHERE p.role = 'family'
    AND NOT EXISTS (
      SELECT 1 FROM caregiver_assignments ca
      WHERE ca.family_user_id = p.id AND ca.is_active = true
    );
$$;
```

Grant execute to authenticated users.

#### 2. `src/components/professional/ProfessionalFamilyAwarenessBanner.tsx`

Replace the direct `profiles` + `caregiver_assignments` queries with a single RPC call:
```ts
const { data, error } = await supabase.rpc('get_unmatched_family_count');
```
This bypasses RLS via security definer and returns just a count (no PII).

#### 3. `src/components/professional/ProfessionalMatchingReadinessBanner.tsx`

Verify it doesn't depend on any RLS-blocked queries. If it's a static banner (just UI nudge), it should show regardless — confirm it renders without data dependencies.

#### 4. `src/components/family/FamilyShortcutMenuBar.tsx`

Add a console log for debugging the story button state. Also add a final fallback: if `loading` is false and `careRecipient` is explicitly null/undefined, force `showStoryButton = true`.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Create | Migration SQL | `get_unmatched_family_count()` security definer function |
| Modify | `ProfessionalFamilyAwarenessBanner.tsx` | Use RPC instead of direct query |
| Verify | `ProfessionalMatchingReadinessBanner.tsx` | Ensure no RLS-blocked dependencies |
| Modify | `FamilyShortcutMenuBar.tsx` | Add debug logging + hardened fallback |

### Result

- Professional dashboard shows blue "X families looking for caregivers" banner
- Professional dashboard shows amber readiness nudge
- Family story button reliably appears when care recipient profile is missing

