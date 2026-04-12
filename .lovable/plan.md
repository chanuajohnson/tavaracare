

## Plan: Add Deep-Link Anchors and Easy Copy Links for Professional Onboarding

### What the user wants
When sending Denise a WhatsApp message with links, the links should take her directly to the relevant section (Notes, Post-Onboarding Summary) without needing to scroll. The admin should also have an easy way to copy these links.

### Changes

**1. Add hash-based scroll anchors to the Professional Onboarding Checklist page (`ProfessionalOnboardingChecklistPage.tsx`)**
- Add `id="notes"` to the `OnboardingNotesCard` wrapper and `id="post_onboarding"` to the post-onboarding section
- On page load, check `window.location.hash` and scroll to the matching element + auto-open the relevant collapsible section
- This enables links like: `https://tavaracare.lovable.app/professional/onboarding-checklist#notes`

**2. Same anchors on Family Onboarding Checklist (`FamilyOnboardingChecklistPage.tsx`)**
- Mirror the same `id` attributes and hash-scroll logic for family links

**3. Add a "Copy Link" helper in the Admin Onboarding Notes section (`AdminOnboardingChecklistPage.tsx`)**
- Add a small "Copy Link for Professional" / "Copy Link for Family" button near the Notes section header
- Clicking it copies the full published URL with `#notes` hash to clipboard (e.g., `https://tavaracare.lovable.app/professional/onboarding-checklist#notes`)
- This way Chan can paste the link directly into WhatsApp

**4. Add a pre-built nudge template for professionals in `UserNudgeTab.tsx`**
- Add a `buildPostOnboardingProfessionalNudge` template similar to the existing family one, with direct links to the professional onboarding checklist and notes section

### Files to modify

| File | Change |
|------|--------|
| `ProfessionalOnboardingChecklistPage.tsx` | Add `id` anchors, hash-scroll on mount |
| `FamilyOnboardingChecklistPage.tsx` | Same anchor/scroll logic |
| `AdminOnboardingChecklistPage.tsx` | Add "Copy Link" buttons near Notes header |
| `UserNudgeTab.tsx` | Add professional post-onboarding nudge template |

### No migration needed
This is purely a frontend UX enhancement.

