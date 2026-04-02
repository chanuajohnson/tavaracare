

## Fix: Remove Self-Rating from Caregiver Screening Page

### Problem

The "Quick Assessment" (Pass / Neutral / Concern) buttons appear on the **caregiver-facing** screening page (`MobileScreeningPage.tsx`). Caregivers should not be rating their own answers -- that's for admin reviewers only.

The admin review panel in `ScreeningSessionManager.tsx` already has its own rating badge display, so this is purely a removal from the caregiver view.

### What the templates look like

The 6 templates in the database match what's on the `/admin/caregiver-screening` page exactly:
- Opening / Rapport (2 questions)
- Clinical Competency (4 questions)
- Team / Rotation Fit (6 questions)
- Reliability, Culture & Red-Flag Checks (12 questions)
- Cultural Sensitivity & Local Context (3 questions)
- Logistics, Transport & Professionalism (4 questions)

No discrepancy there -- the earlier list I provided was accurate.

### Solution

**File: `src/pages/screening/MobileScreeningPage.tsx`**

1. **Remove the "Quick Assessment" UI block** (lines 374-395) -- the entire Pass/Neutral/Concern button section
2. **Remove `selectedRating` state** (line 36) and all references to it
3. **Remove rating from response saving** -- stop writing `rating` to the response object (lines 164, 179, etc.)
4. **Remove unused imports**: `ThumbsUp`, `Minus`, `AlertTriangle` from lucide-react
5. **Keep the `rating` field in the response interface** so existing admin-side rating display still works (admin can still see any previously saved ratings)

### What stays the same

- Voice recording and text input remain as the two response methods
- Admin review panel continues to show color-coded rating badges for any ratings that exist
- Navigation (Previous/Next/Submit) unchanged
- Progress bar and question category badge unchanged

