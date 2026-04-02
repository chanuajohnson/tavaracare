

## Fix: Completed Screening Links Should Redirect to Progress Page

### Problem

When a caregiver clicks a WhatsApp screening link for a session they've already completed (e.g., `/screening/9226799b-...`), they see the static "Thank You" page instead of the multi-session progress page at `/professional/screening`. This is confusing because they can't see their remaining sessions or continue.

### Solution

**File: `src/pages/screening/MobileScreeningPage.tsx`**

In the `fetchSession` function (around line 126), when the session status is `completed` or `reviewed`:

1. Check if the user is authenticated (has a logged-in professional account)
2. If yes, redirect them to `/professional/screening` -- the progress page showing all their sessions with "Begin" / "Continue" buttons for incomplete ones
3. If not authenticated, keep the current "Thank You" message as a fallback (they can't access the progress page without being logged in)

**Specific change:**

Replace the block at lines 126-128:
```tsx
if (data.status === 'completed' || data.status === 'reviewed') {
  setSubmitted(true);
}
```

With:
```tsx
if (data.status === 'completed' || data.status === 'reviewed') {
  // Redirect authenticated users to the progress page
  // so they can see remaining sessions and continue
  const { data: authData } = await supabase.auth.getSession();
  if (authData?.session) {
    navigate('/professional/screening');
    return;
  }
  setSubmitted(true);
}
```

This requires adding `useNavigate` from react-router-dom (import already exists via `useParams`, just add `useNavigate`).

### What This Fixes

- Authenticated caregivers clicking a completed session's link get taken to their progress dashboard showing 5/6 completed with a "Begin" button on the remaining one
- Non-authenticated users still see the Thank You page (graceful fallback)
- New/in-progress session links continue to work exactly as before

