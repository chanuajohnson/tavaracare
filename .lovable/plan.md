

## Fix Three Issues: Family Detail Modal, Family Count, and Dashboard Routing

### Issue 1: "View Details" on family cards opens WhatsApp instead of a modal

Both "View Details" and "WhatsApp" buttons call `handleWhatsAppInquiry`. "View Details" should open a detail modal (like `SpotlightCaregiverDetailModal`) showing care assessment info without PII.

**Fix:** Create `FamilyDetailModal` component and wire "View Details" to open it.

**New file: `src/components/family/FamilyDetailModal.tsx`**
- Modal matching `SpotlightCaregiverDetailModal` layout
- Shows: initials avatar, general area, care schedule, care types, diagnosed conditions, chronic illness, urgency badge
- No names, no addresses, no phone numbers
- Single WhatsApp CTA at bottom
- Data comes from what's already fetched via `get_public_family_profiles` RPC

**Modify: `src/pages/UrgentFamiliesPage.tsx`**
- Add state for `selectedFamily` and `showDetailModal`
- "View Details" button opens modal with selected family
- "WhatsApp" button stays as-is
- Import and render `FamilyDetailModal`

---

### Issue 2: Professional dashboard shows "11 families" instead of 2

The `get_unmatched_family_count()` RPC counts ALL family profiles without active assignments — it does NOT filter by `available_for_matching = true`. Only 2 families are marked available in admin.

**Fix — Database migration:** Update `get_unmatched_family_count()` to add `AND p.available_for_matching = true`:

```sql
CREATE OR REPLACE FUNCTION public.get_unmatched_family_count()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer
  FROM profiles p
  WHERE p.role = 'family'
    AND p.available_for_matching = true
    AND NOT EXISTS (
      SELECT 1 FROM caregiver_assignments ca
      WHERE ca.family_user_id = p.id AND ca.is_active = true
    );
$$;
```

---

### Issue 3: Professional user sees Family Dashboard at `/dashboard/family`

The `/dashboard/family` route has no role guard — any logged-in user can navigate to it. In development, the preview URL bar shows `/dashboard/family` which the user navigated to directly.

**Fix: `src/components/routing/AppRoutes.tsx`**
- The route at line 117 imports `FamilyDashboard` from `@/components/family/FamilyDashboard` instead of from `@/pages/dashboard/family` (the page wrapper). This means there's no auth redirect happening. Update the import to use the page wrapper which already has the auth check. But actually — the page wrapper redirects non-users to `/auth`, not non-family users. A proper fix:
- Add a role check: if user's role !== 'family', redirect to their correct dashboard. This can be a simple wrapper or inline check in the page component.

**Simpler approach:** Update `src/pages/dashboard/family.tsx` to also check role and redirect professional users to `/dashboard/professional`. Then update `AppRoutes.tsx` line 117 to use the page wrapper instead of the raw component.

---

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Create | `src/components/family/FamilyDetailModal.tsx` | Detail modal for family cards — shows care info without PII |
| Modify | `src/pages/UrgentFamiliesPage.tsx` | Wire "View Details" to open `FamilyDetailModal` instead of WhatsApp |
| Migrate | Database | Update `get_unmatched_family_count()` to filter by `available_for_matching = true` |
| Modify | `src/components/routing/AppRoutes.tsx` | Use `FamilyDashboardPage` wrapper for `/dashboard/family` route |
| Modify | `src/pages/dashboard/family.tsx` | Add role check — redirect non-family users to their correct dashboard |

