

## Plan: Fix 3 Admin Onboarding Checklist Issues

### Issue 1: Denise Narcis Shows 0 Documents Uploaded

**Root Cause**: The `professional_documents` table has RLS policies that only allow `auth.uid() = user_id`. When an admin queries this table for another professional's documents, the query returns empty because the admin's `auth.uid()` doesn't match the professional's `user_id`.

**Fix**: Add a new RLS SELECT policy on `professional_documents` granting admin read access:
```sql
CREATE POLICY "Admins can view all professional documents"
  ON public.professional_documents FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());
```

This is a **database migration only** — no code changes needed. The `ProfessionalSubmissionReview.tsx` component already queries this table correctly; it's just being blocked by RLS.

---

### Issue 2: Add "(WhatsApp)" Labels to Communication Items

**File**: `src/components/admin/onboarding/professionalOnboardingSections.ts`

Update three items in the `communication_support` section (lines 119-121) and one in `platform_walkthrough` (line 46):

| Current Text | Updated Text |
|---|---|
| `"Message board and communication tools"` | `"Message board and communication tools (WhatsApp)"` |
| `"Professional message board for peer support"` | `"Professional message board for peer support (WhatsApp)"` |
| `"How to report concerns or request support through the platform"` | `"How to report concerns or request support through the platform (WhatsApp)"` |

---

### Issue 3: Allow Admin to Edit/Delete Notes & Action Items

**File**: `src/components/admin/onboarding/OnboardingNotesCard.tsx`

Currently, notes are rendered as read-only text with no edit or delete controls. Changes:

1. Add `onDeleteNote` and `onEditNote` optional callback props to the component
2. When not `readOnly`, show edit (pencil icon) and delete (trash icon) buttons on each note
3. Edit: clicking edit puts the note text into an inline input; save updates via callback
4. Delete: clicking delete triggers a confirmation and calls the delete callback

**File**: `src/pages/admin/AdminOnboardingChecklistPage.tsx`

1. Implement `handleDeleteNote` — removes the note from the notes array by index, persists updated array to Supabase (both family and professional checklist tables)
2. Implement `handleEditNote` — updates the note text at the given index, persists to Supabase
3. Pass these new handlers to `OnboardingNotesCard`

---

### Files Modified

| File | Change |
|------|--------|
| **Migration** (new SQL) | Add admin SELECT policy on `professional_documents` |
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | Add "(WhatsApp)" to 3 checklist item labels |
| `src/components/admin/onboarding/OnboardingNotesCard.tsx` | Add edit/delete UI and callback props |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Implement edit/delete note handlers, pass to component |

