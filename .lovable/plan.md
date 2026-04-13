
## Plan: Fix bi-directional approval persistence and surface the approval block inside Admin Post-Onboarding

### What I found
There are two separate problems behind what you’re seeing:

1. Professional approval is being saved from the professional page with:
   - `update(...).eq("professional_id", user.id)` in `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx`
   - but `professional_onboarding_checklists` now supports multiple rows per professional via `(professional_id, family_id)`
   - so this update/load path is no longer family-specific and is vulnerable to loading/updating the wrong row or failing to reflect the correct assigned-family record in admin

2. Admin currently shows approval only in the top “Professional Feedback Summary” card, not inside the actual `post_onboarding` section body
   - so the admin cannot see the same final approval block that the professional/family sees at the bottom of their checklist
   - that is why it feels like “the end approval section” is missing on admin

### Implementation
#### 1) Make professional approval family-specific and persistent
**File:** `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx`

- Load `family_id` together with `checked_items`
- Store the assigned family id in state
- Change the initial query from a broad `.eq("professional_id", user.id).maybeSingle()` flow to a deterministic record selection for the assigned checklist row
- Change approval save to:
  - update by both `professional_id` and `family_id`
  - if needed, use upsert with `onConflict: "professional_id,family_id"` to match the admin save pattern
- Change note save to also target the same `(professional_id, family_id)` row
- Keep self-approval metadata intact so when the professional approves, admin sees:
  - `professional_approval_confirmed: true`
  - `professional_approval_date`
  - no `professional_approval_by: "admin"` unless admin actually did it

Result: when Tricia approves on her side, it persists on the exact assigned-family checklist row and admin reads the same saved record.

#### 2) Make admin and professional/family views truly bi-directional
**Files:** 
- `src/pages/admin/AdminOnboardingChecklistPage.tsx`
- `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx`
- `src/pages/family/FamilyOnboardingChecklistPage.tsx`

- Preserve current admin toggle behavior
- Ensure admin toggling writes to the same JSON keys the user pages read
- Ensure self-approval pages read the same keys admin writes
- Standardize display rules:
  - self-approved: show “Approved — Digital signature recorded …”
  - admin-approved: show same approved state plus “by Admin” / “recorded by admin on behalf”
- Do the same consistency pass for family `family_approval_confirmed` so service commencement behaves identically

Result: whether the user approves or admin approves on their behalf, both sides show the same approved milestone state.

#### 3) Show the approval block inside Admin Post-Onboarding section
**File:** `src/pages/admin/AdminOnboardingChecklistPage.tsx`

Inside the `section.id === "post_onboarding"` block:
- For Professional tab:
  - render the readiness approval card inside the section body under the care summary
  - show approved state, date, and admin attribution if applicable
  - keep the summary card at top, but also mirror the real end-of-checklist approval area
- For Family tab:
  - render the service commencement approval block inside admin post-onboarding as well
  - include care start date / first billable week text and approved state
  - show attribution when admin toggled on behalf of family

Result: admin gets “eyes on everything” and can see the actual final milestone block where onboarding transitions into active care.

#### 4) Tighten professional checklist row selection in admin
**File:** `src/pages/admin/AdminOnboardingChecklistPage.tsx`

- Review the professional checklist loader so it always targets the selected `professional_id + family_id` pair
- Avoid any fallback that can accidentally mask the correct row after selection changes
- Keep the assigned family selector, but make the selected row the single source of truth

Result: admin sees the correct family-specific professional onboarding record every time.

### Files to modify
- `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx`
- `src/pages/family/FamilyOnboardingChecklistPage.tsx`
- `src/pages/admin/AdminOnboardingChecklistPage.tsx`

### No migration needed
The UPDATE policy for professionals already exists, and the DB currently contains:
- professional approval saved for Tricia + User1 Family
- family approval saved for User1 Family
So this is now a frontend record-targeting and visibility issue, not a new schema issue.

### Technical note
Current DB read confirms:
- `professional_onboarding_checklists` has Tricia + User1 Family with `professional_approval_confirmed = true`
- `onboarding_checklists` has User1 Family with `family_approval_confirmed = true`

That means the main bug is that the UI is not consistently loading/rendering the exact pair-specific approval record and not mirroring the approval block inside admin post-onboarding.

