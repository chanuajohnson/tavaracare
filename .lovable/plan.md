

## Fix: Three Screening & References Issues

### Problem Summary

1. **Denise not in screening list**: The `screening_sessions` table is empty — no session has been created for her yet. This is an admin action on `/admin/caregiver-screening`.

2. **References tab appears empty**: The tab content IS there in `ProfessionalProfileHub.tsx` (line 155-170) with `<ProfessionalReferencesForm />`. The issue is likely that the page scrolls to the profile card area and the tab content is below the fold, OR there's a rendering issue with the tab not activating from the URL param. Need to verify the `?tab=references` URL param is being read correctly.

3. **"Awaiting Interview" goes to wrong page**: Step 6 in `useEnhancedProfessionalProgress.ts` (line 207) points to `/professional/profile?tab=references` — this is wrong. It should go to a professional-facing screening page where the caregiver can see their assigned screening questions and record voice responses.

---

### Plan

#### Fix 1: Update Step 6 link and create a professional screening view

**File: `src/hooks/useEnhancedProfessionalProgress.ts`**
- Line 206-207: Change step 6 title from "Head nurse screening interview" to "Professional caregiver screening interview"
- Change description from "Complete a brief interview with our Head Nurse for final clearance" to "Complete a brief screening interview for final clearance"
- Change link from `/professional/profile?tab=references` to `/professional/screening`

**File: `src/pages/professional/ProfessionalScreeningLandingPage.tsx`** (NEW)
- Create a new page for the professional to see their assigned screening sessions
- Query `screening_sessions` where `professional_id = auth.uid()`
- If a session exists with status `pending` or `in_progress`, redirect to `/screening/:token` (the existing MobileScreeningPage)
- If no session exists, show a waiting state: "Your screening interview has not been assigned yet. The Tavara team will send you a link when it's time."
- If session is `completed`, show a confirmation message

**File: `src/components/routing/AppRoutes.tsx`**
- Add route: `/professional/screening` → `ProfessionalScreeningLandingPage`

#### Fix 2: Update step 6 terminology across the dashboard

**File: `src/hooks/useEnhancedProfessionalProgress.ts`**
- Line 205: Title → "Professional caregiver screening"
- Line 206: Description → "Complete a brief screening interview for final clearance"
- Line 171: Button text → "Awaiting Screening" (instead of "Awaiting Interview")

#### Fix 3: Ensure references tab activates properly

**File: `src/components/professional/ProfessionalProfileHub.tsx`**
- The `useEffect` on line 23-28 reads the `tab` URL param — this looks correct
- Need to ensure the tab value `references` scrolls into view after mount so the user sees the form content, not just the profile header above it

---

### Technical Detail

- The existing `MobileScreeningPage` at `/screening/:token` already has the full voice recording UI. The new professional landing page just looks up the professional's session and redirects there.
- No database changes needed — `screening_sessions` already has `professional_id` and `access_token` fields.
- The admin still creates sessions on `/admin/caregiver-screening` and sends the link. But now the professional can also find their screening from their dashboard journey steps.
- Step 5 link (`/professional/profile?tab=references`) remains correct for the references step.

