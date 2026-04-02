

## Fix: Three Issues — Thank You Page Navigation, References Form, and Missing Delete Policy

### Issue 1: Thank You Page Has No Navigation After Screening Submission

**Problem:** After a professional submits a screening questionnaire, the Thank You page shows only a static message with no way to navigate forward. No breadcrumb, no buttons -- the user is stuck.

**Fix in `src/pages/screening/MobileScreeningPage.tsx`:**

After submission (line 251), instead of just setting `submitted = true`, check if the user is authenticated. If yes, redirect to `/professional/screening` (the progress page) after a brief 3-second delay so they see the success toast. Also update the `submitted` fallback UI (lines 288-301) to include:
- A "View Screening Progress" button linking to `/professional/screening`
- A "Return to Dashboard" button linking to `/dashboard/professional`

This way both authenticated users (auto-redirect) and unauthenticated users (manual buttons) have clear next actions.

### Issue 2: "Add References" Button Causes Page Reload, Cannot Add References

**Problem:** Clicking "Add References →" from the dashboard navigates to `/professional/profile?tab=references`. The `ProfessionalProfileHub` component reads the `tab` query param on mount and sets the active tab. However, the component is already mounted if the user is on the profile hub, so navigating with a new query param causes a full page re-mount. The real blocker is likely a missing RLS **DELETE** policy, but the insert works fine based on the policy check.

**Root cause identified:** The `ProfessionalProfileHub` only reads the `tab` query param in the initial `useEffect` (line 23-36) -- it uses `window.location.search` instead of reacting to URL changes. If the professional navigates there from another page, it should work. But if already on the page, it won't update.

**Fix in `src/components/professional/ProfessionalProfileHub.tsx`:**
- Use `useSearchParams` from react-router-dom instead of `window.location.search` so it reacts to navigation changes properly.

**Fix for delete — new migration:**
- Add an RLS policy allowing professionals to delete their own pending references: `DELETE WHERE professional_id = auth.uid() AND status = 'pending'`

### Issue 3: No Breadcrumb on Screening Page

**Problem:** The `MobileScreeningPage` has no breadcrumb or header navigation.

**Fix in `src/pages/screening/MobileScreeningPage.tsx`:**
- The screening page uses a full-width header with progress bar. Adding a breadcrumb would conflict with the mobile-first design. Instead, add a small "← Back to Dashboard" link in the Thank You state and at the top of the screening header.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/screening/MobileScreeningPage.tsx` | Add auto-redirect after submission for authenticated users; add navigation buttons to Thank You state; add back link |
| `src/components/professional/ProfessionalProfileHub.tsx` | Use `useSearchParams` for reactive tab switching |
| New migration | Add DELETE RLS policy for professionals on `professional_references` table |

