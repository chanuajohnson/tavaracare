

## Briefing + Multi-Feature Plan: Onboarding Checklist Persistence, Public Access, Family View & Notes

### Your Call Briefing (above in chat)

The data briefing for Ana Maria Aimey and her mother Carol Glenn-Aimey is provided above. Key points to nail the call:
- Carol is an independent, proud retired educator (74) who doesn't like being "bossed around"
- Core needs: medication management, meal prep, housekeeping, vitals, memory reminders
- Ana Maria wants Mon-Fri + Sat-Sun 8am-4pm, professional caregiver, $20-25/hr, English-speaking
- She already created her care plan — acknowledge and validate that

---

### Feature Plan (4 changes)

#### 1. Persist Checklist Data to Supabase (not just localStorage)

**New table**: `onboarding_checklists`
- `id` UUID PK
- `family_id` UUID references profiles(id)
- `checked_items` JSONB (the checklist state)
- `notes` JSONB (array of note objects with text, assigned_to, created_by, created_at)
- `started_at` timestamp
- `updated_at` timestamp
- RLS: admins can read/write all; family users can read their own

**Changes to `AdminOnboardingChecklistPage.tsx`**:
- On family select, load from `onboarding_checklists` table (fall back to localStorage for migration)
- On checkbox toggle or note add, upsert to Supabase
- Debounced saves to avoid excessive writes

#### 2. Add Notes & Action Items Card

Add a final section at the bottom of the checklist (after Communication & Notifications):
- **"Notes & Action Items"** card with:
  - Text area to type a note
  - Dropdown to assign to: Admin, Family, Caregiver
  - "Add Note" button
  - List of existing notes with timestamp, author, assignee
  - Notes persist in the `onboarding_checklists.notes` JSONB column

#### 3. Family-Facing Onboarding Checklist (Read-Only)

**New route**: `/family/onboarding-checklist`
**New page**: `src/pages/family/FamilyOnboardingChecklistPage.tsx`
- Loads the family's onboarding checklist from `onboarding_checklists` where `family_id = auth.uid()`
- Read-only view of checked items (family can see progress but cannot edit checkboxes)
- Shows notes/action items assigned to them
- Same section structure as admin version but without admin-only controls
- Add quick link on `FamilyShortcutMenuBar` when an onboarding checklist exists for this family

#### 4. Public-Facing Blank Checklist

**New route**: `/onboarding-guide` (no auth required)
**New page**: `src/pages/public/OnboardingGuidePage.tsx`
- Static, blank version of the checklist (no family data, no checkboxes active)
- Shows the full section structure as a reference guide
- No persistence, no family selector
- Shareable URL for your co-founder

### Files Changed

| File | Change |
|------|--------|
| **Migration** | Create `onboarding_checklists` table with RLS |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Switch persistence from localStorage to Supabase, add Notes section |
| `src/components/admin/onboarding/OnboardingNotesCard.tsx` | New: notes/action items component |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | New: family read-only view |
| `src/pages/public/OnboardingGuidePage.tsx` | New: public blank checklist |
| `src/components/routing/AppRoutes.tsx` | Add 2 new routes |
| `src/components/family/FamilyShortcutMenuBar.tsx` | Add onboarding checklist quick link |
| `src/components/admin/onboarding/onboardingSections.ts` | Extract shared section data to reusable module |

### Database Schema

```sql
CREATE TABLE onboarding_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  checked_items JSONB DEFAULT '{}'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: admins full access, family read own
ALTER TABLE onboarding_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all onboarding checklists"
  ON onboarding_checklists FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Families can view their own onboarding checklist"
  ON onboarding_checklists FOR SELECT TO authenticated
  USING (family_id = auth.uid());
```

