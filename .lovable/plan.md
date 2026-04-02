

## Fix: Screening Link Redirects to Dashboard Instead of Questionnaire

### Root Cause

When a logged-in professional clicks a WhatsApp screening link like `https://tavara.care/screening/abc123`, the `AuthProvider` post-login redirection logic kicks in. It checks if the current path is exempt from redirect (e.g., `/professional/`, `/family/`, `/admin/`), but `/screening/` is **not** in the exempt list. So the auth system redirects the professional to `/dashboard/professional` before the screening page can load.

### Solution

**File: `src/hooks/auth/useAuthRedirection.ts`**

Add a skip condition for `/screening/` paths, right after the existing `/admin/` skip block (around line 39):

```tsx
// Skip redirect on public screening pages (token-based)
if (location.pathname.startsWith('/screening/')) {
  console.log('[AuthProvider] On screening page, skipping redirection');
  return;
}
```

This is a one-line fix. The `/screening/:token` route is intentionally public and token-based -- it should never be intercepted by auth redirection, whether the user is logged in or not.

### What This Fixes

- Professionals who are already logged in can now click WhatsApp screening links and land on the questionnaire page instead of being bounced to their dashboard
- The screening page itself handles session validation via the access token, so no auth protection is needed

