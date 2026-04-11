

## Plan: Fix /subscription Redirect + Reinstate Free Plan with Journey Features

### Problem 1: /subscription redirects to dashboard
The `useAuthRedirection.ts` hook redirects logged-in users to their role-based dashboard. The `/subscription` path is not in the skip list, so authenticated users get bounced before the page loads.

### Problem 2: Free plan needs journey-based features
The Free plan currently lists generic features (chat, profiles, care posting, email support). It should reflect what families like Ana Maria actually use for free on their journey.

### Changes

**File 1: `src/hooks/auth/useAuthRedirection.ts`**
Add `/subscription` to the redirect exemption list (similar to `/screening/`, `/family/`, `/admin/`):
```
if (location.pathname.startsWith('/subscription')) {
  console.log('[AuthProvider] On subscription page, skipping redirection');
  return;
}
```

**File 2: `src/pages/subscription/SubscriptionPage.tsx`**
Update the Family Basic (Free) plan features to reflect the actual journey tools families use:

| Free Plan Features (included) |
|---|
| Complete family profile and care preferences |
| Initial care needs assessment |
| Legacy Story for your loved one |
| Instant caregiver matching |
| Medication management and scheduling |
| Meal planning and grocery lists |
| Unlimited caregiver chat |
| Email and community support |

| Free Plan Features (not included) |
|---|
| Dedicated care coordinator |
| Priority caregiver matching |
| Video consultations with caregivers |
| Weekly/monthly billing management |

The three-card layout stays intact with the global weekly/monthly toggle:
- **Family Basic** -- Free (no toggle effect)
- **Family Care** -- $199.99/week or $699.99/month
- **Family Premium** -- $399.99/month or $1,099.99/month

No other files changed. No routes, no database, no registration files touched.

