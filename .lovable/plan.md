

## Plan: Professional Onboarding Feedback Visibility for Admin + Journey Sync

### Problem Summary
Denise Narcis has checked off many items on her professional onboarding checklist (via WhatsApp she says "done") but:
1. **Admin can't see her feedback**: The admin onboarding checklist page shows items as admin-checked, but there's no indicator showing which items the *professional herself* has reviewed/acknowledged
2. **Journey progress is stale at 63%**: Her `user_journey_progress` shows 63% (5/8 steps) because Step 6 (screening) requires a `professional_screening` record with `head_nurse_interview` + `passed` status, but she only has `screening_sessions` with `reviewed` status. The existing code already handles this fallback in the frontend hook but the DB RPC doesn't.
3. **No onboarding checklist progress reflected in journey**: The onboarding checklist completion (she's done ~48 of 67 items) doesn't feed into her journey progress at all
4. **Assigned family (Ana Maria Aimey) has no visibility** into the professional's readiness status

### What's Being Built

#### 1. Admin-Visible "Professional Acknowledged" Indicators on Checklist
**File: `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

In the `ChecklistTabContent` component, for professional checklists, show visual indicators next to each section header showing:
- Whether the professional has viewed their onboarding checklist (based on the professional's own `checked_items` data being non-empty)
- Note acknowledgment status (already exists in the notes card but needs a summary badge at the top)
- A "Professional Readiness" summary card above the checklist showing: total items checked by admin, notes acknowledged by professional (count), Readiness Approval status (signed or not), and last activity timestamp

This requires loading the professional's own view of their checklist in the admin page. Currently, both admin and professional write to the **same** `professional_onboarding_checklists` row — so the data is already there. The admin just needs better visibility into acknowledgment-related fields.

#### 2. Onboarding Completion Progress Card on Professional Dashboard
**File: `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx`**

Add a summary card at the top showing:
- Overall onboarding completion percentage (checked items / total items)
- Section-by-section progress badges
- Readiness Approval status
- Link to assigned family info

#### 3. Fix Journey Progress to Count Screening Sessions
**File: `src/hooks/professional/completionCheckers.ts`**

Update `hasPassedScreening` to also check if all screening sessions are `completed` or `reviewed` (matching the logic already in `useSpecificUserProfessionalProgress.ts` lines 50-55 which already does this but the checker function itself doesn't).

#### 4. Family-Facing "Your Caregiver is Ready" Card
**File: `src/hooks/useSharedFamilyJourneyData.ts`** and a new component

For the assigned family (Ana Maria Aimey), show a card on their dashboard indicating their assigned professional's onboarding status — e.g., "Your caregiver Denise is completing final onboarding preparations" or "Your caregiver is ready to begin".

This reads from `professional_onboarding_checklists` where `family_id` matches the family user.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add "Professional Feedback Summary" card showing acknowledgment counts, readiness approval status, note response status |
| `src/hooks/professional/completionCheckers.ts` | Update `hasPassedScreening` to also accept reviewed screening sessions as passing |
| `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` | Add journey step progress summary at top of page |
| `src/components/family/CaregiverReadinessCard.tsx` | **New** — card showing assigned professional's onboarding readiness for the family dashboard |
| `src/pages/dashboard/FamilyDashboard.tsx` | Import and render `CaregiverReadinessCard` |

### No migration needed
All data already exists in `professional_onboarding_checklists`, `screening_sessions`, and `professional_screening` tables. This is frontend-only.

