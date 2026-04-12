

## Plan: Multi-Family Professional Checklists + Note Edit/Delete

### Analysis

**Question 1: Multiple onboarding checklists per professional**

Currently, the `professional_onboarding_checklists` table has a `UNIQUE (professional_id)` constraint -- meaning each professional gets exactly ONE checklist row. The "Assigned Family" dropdown stores a single `assigned_family_id` inside the `checked_items` JSON. So if Trisha Calm is assigned to two families, she can only have one checklist with one linked family.

**To support per-family checklists**, we need to:

1. **Change the DB schema**: Replace the `UNIQUE (professional_id)` constraint with `UNIQUE (professional_id, family_id)`, adding a proper `family_id` column to `professional_onboarding_checklists`.
2. **Update the admin UI**: When a professional is selected, show which families they're assigned to (from `care_team_members`), let the admin pick one, and load/save the checklist for that specific professional+family pair.
3. **Update the upsert logic**: Change `onConflict: "professional_id"` to `onConflict: "professional_id,family_id"`.

**Question 2: Edit/delete notes**

The `OnboardingNotesCard` component currently only has an "Add Note" flow. Notes are stored as a JSON array. Adding edit and delete is straightforward:

- Add a pencil (edit) and trash (delete) icon button to each note row
- Edit opens an inline editor or replaces the text with a textarea
- Delete removes the note from the array after confirmation
- Both trigger the save-to-Supabase debounce

### Changes

| File | Change |
|------|--------|
| **Migration** | Add `family_id` column to `professional_onboarding_checklists`, drop old unique constraint, add new composite unique on `(professional_id, family_id)`, update RLS |
| **`AdminOnboardingChecklistPage.tsx`** | When professional is selected, fetch their assigned families from `care_team_members`, show a family selector, load/save checklist by `(professional_id, family_id)` pair instead of just `professional_id` |
| **`OnboardingNotesCard.tsx`** | Add `onEditNote` and `onDeleteNote` callback props. Render edit (pencil) and delete (trash) buttons on each note. Inline editing via textarea. Confirmation dialog on delete |
| **`AdminOnboardingChecklistPage.tsx`** | Add `handleFamilyEditNote`, `handleFamilyDeleteNote`, `handleProfEditNote`, `handleProfDeleteNote` functions that update the notes array and trigger save |

### Technical Details

**Migration SQL (conceptual)**:
```sql
ALTER TABLE professional_onboarding_checklists 
  ADD COLUMN family_id uuid REFERENCES profiles(id);

-- Migrate existing data: copy assigned_family_id from checked_items JSON
UPDATE professional_onboarding_checklists 
  SET family_id = (checked_items->>'assigned_family_id')::uuid
  WHERE checked_items->>'assigned_family_id' IS NOT NULL;

ALTER TABLE professional_onboarding_checklists 
  DROP CONSTRAINT unique_professional_onboarding;

ALTER TABLE professional_onboarding_checklists 
  ADD CONSTRAINT unique_professional_family_onboarding 
  UNIQUE (professional_id, family_id);
```

**Professional tab flow change**:
- Select professional -> fetch their care_team_members assignments -> populate "Assigned Family" dropdown with only those families
- Selecting a family loads the checklist for that specific (professional, family) pair
- Each family gets its own independent checklist, notes, and progress

**Notes edit/delete**:
- Each note gets a small edit (Pencil) and delete (Trash2) icon
- Edit: toggles inline textarea, save button commits change
- Delete: `window.confirm()` then removes from array
- Both call the parent's save function to persist to Supabase

