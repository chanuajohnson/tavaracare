## Goal

Replace the placeholder "Subscription started" step in the Acquisition Funnel with a real count sourced from where admins actually assign subscriptions: `/admin/onboarding-checklist`, Family tab, checklist item `post_onboarding_6` ("Tavara subscription: Family Care Plan (weekly)").

## Source of truth

- Table: `public.onboarding_checklists`
- Columns used: `family_id`, `checked_items` (jsonb), `updated_at`
- A family is "subscribed" when `checked_items->>'post_onboarding_6' = 'true'`
- The date for in-range filtering is `updated_at` (no per-item timestamp exists; this is the best available signal and matches admin behavior)
- These are **family-only** by definition (the checklist key lives on the family checklist). No professional equivalent.

## Changes

### 1. `src/hooks/admin/useBlogAnalyticsRange.ts`
Add a second query alongside the existing `cta_engagement_tracking` fetch:

```ts
const { data: subRows } = await supabase
  .from("onboarding_checklists")
  .select("family_id, updated_at, checked_items")
  .gte("updated_at", previousStart.toISOString());
```

Filter in-memory to rows where `checked_items?.post_onboarding_6 === true`, then split into `subscriptionsCurrent` / `subscriptionsPrevious` by `updated_at` vs `rangeStart`. Extend `BlogAnalyticsData` with these two arrays (shape: `{ family_id, updated_at }[]`).

### 2. `src/components/admin/blog-analytics/AcquisitionFunnelCard.tsx`
- Accept the new `subscriptions` prop (current range).
- In `buildSteps`, replace the placeholder `subStarted` count:
  - **Combined tab**: `subscriptions.length`
  - **Family tab**: same count (these are all family rows)
  - **Professional tab**: `0` with a small caption "Subscriptions are family-only"
- Update label to **"Subscription assigned (admin)"**.
- Drop `isPlaceholder` / "not yet tracked" footer when count source is real.
- Keep the existing drop-off math intact.

### 3. Drill-down dialog parity
Extend the existing "View users" pattern with a second link **"View subscriptions"** on the new step. It opens a dialog that:
- Lists each family from `subscriptionsCurrent` (filtered by tab role — only shows on Combined/Family).
- Resolves `family_id` → `profiles.full_name, phone_number, created_at` via the same in-memory profile fetch we already do.
- Shows: family name, phone, "Assigned ~ {updated_at}" (with a note that the timestamp reflects the last checklist edit, not the exact tick moment).
- Reuses the copy-id button and styling from `RegistrationUsersDialog`.

### 4. Parent wiring
Whichever page renders `<AcquisitionFunnelCard events={...} />` (the admin blog analytics page) — pass the new `subscriptions` array through from the hook's return value. No new top-level fetch.

## Explicitly out of scope

- No changes to `user_subscriptions`, PayPal flow, or any checkout wiring.
- No GA4 event for subscription assignment (admin action, no browser context).
- No edits to `/admin/onboarding-checklist` itself — read-only consumption.
- No tier breakdown (Basic / Active Care / Premium) — the checklist key is binary. If you want tier splits later, that's a separate task tied to `care_plan_service_selections` or a new column.

## Caveats called out in UI

- Caption under the step: *"Counted from admin-marked onboarding checklist (Family tab → 'Tavara subscription'). Timestamp reflects last checklist edit."*
