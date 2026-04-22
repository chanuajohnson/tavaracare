

## Plan — Admin-editable subscription plans on `/subscription`

### What you'll get

A new admin-only **Manage Plans** mode on `/subscription` that lets you edit every visible plan card — name, description, weekly & monthly prices, period labels, button text, "popular" badge, and the full feature list (text + included/not-included + Add-on flag) — with changes saved to the database and rendered live for all users. No more hunting in code to tweak a price or a feature.

### Why this is needed

Today every plan on `/subscription` is hardcoded inside `src/pages/subscription/SubscriptionPage.tsx` (the `familyPlans` and `professionalPlans` arrays, lines 99–361). Each pricing tweak or feature wording change requires a code edit. The `subscription_plans` table exists in the DB but is barely used (just `name`, `price`, `duration_days`, `description`, `features` JSON) and isn't the source of truth for the page.

### Approach — DB-backed plans + admin inline editor

**1. Extend `subscription_plans` table** (one migration) with the columns the UI needs:

| Column | Type | Purpose |
|---|---|---|
| `audience` | text | `'family'` or `'professional'` — which list the plan belongs to |
| `slug` | text | stable id used in code (`basic`, `care`, `premium`, `pro`, `expert`) |
| `price_weekly` | numeric (nullable) | weekly price; null = "Free" |
| `price_monthly` | numeric (nullable) | monthly price; null = "Free" |
| `period_weekly` | text | label e.g. `"week"`, `""` |
| `period_monthly` | text | label e.g. `"month"`, `"monthly"` |
| `button_text` | text | CTA label |
| `is_popular` | bool | shows "Most Popular" badge |
| `sort_order` | int | left-to-right order |
| `features` (existing JSON) | jsonb | `[{ name, included, is_addon }]` array |
| `is_active` | bool | hide a plan without deleting |

Existing `price` column kept (legacy, for `user_subscriptions` joins). One-time seed inserts the 6 current plans (3 family + 3 professional) with the exact text/prices currently shown so nothing visually changes for end users on day one.

**2. RLS policies**
- `SELECT`: anyone (anon + authed) can read active plans → keeps the public-facing page working
- `INSERT/UPDATE/DELETE`: only `has_role(auth.uid(), 'admin')` → uses the existing `has_role` security-definer function

**3. Refactor `SubscriptionPage.tsx` to render from DB**
- Replace hardcoded `familyPlans` / `professionalPlans` consts with a `useSubscriptionPlans()` hook that fetches from `subscription_plans` ordered by `audience` + `sort_order`
- Map DB rows → the same shape the existing render loop uses (so the visual code at lines 622–684 is untouched apart from price formatting: `null → "Free"`, number → `$X` / `$X,XXX`)
- Loading skeleton while fetching (replaces the current spinner)
- If fetch returns empty (e.g. cold DB), fall back to the current hardcoded arrays once so the page never breaks

**4. New admin editor — `PlanManagerDrawer`**
- Visible only when `userRole === 'admin'`: a small "Manage Plans" button appears next to "Go Back" at the top of `/subscription`
- Opens a side drawer (existing `Sheet` component) listing all plans grouped by audience tab (Family / Professional)
- Each plan row expands to a form with:
  - Name, description, button text (text inputs)
  - Weekly price + period, Monthly price + period (number + text; blank price = "Free")
  - "Most Popular" toggle, "Active" toggle, sort order
  - **Features editor**: drag-to-reorder list of `{ name, included, is_addon }` rows with add / delete buttons; `is_addon` checkbox shows the amber "Add-on" pill in preview
- Live preview pane on the right of the drawer renders the plan card exactly as users will see it (reuses the same card JSX)
- Save button writes via `supabase.from('subscription_plans').update(...)`; refetches the page list on success; toast confirmation
- "Add new plan" button at the bottom of each tab

**5. Admin guard**
- Editor mounted but its trigger button only renders when `userRole === 'admin'` (already available from `useAuth()`); RLS enforces server-side regardless

### Out of scope (not changing)
- `App.tsx`, routing, `AuthProvider`, registration flows (per project guardrails)
- The actual checkout / payment processing logic in `handleSubscribe` (still demo-only as today)
- `user_subscriptions` table or `usePayPalSubscription` (untouched — they reference `subscription_plans.id` which we preserve)
- The "Add-on" pill rendering logic at lines 644–656 (already supports the new `is_addon` flag via the same `Add-on:` prefix convention; the editor will write the prefix when `is_addon` is true to stay backward-compatible)
- Professional plan tiers stay as-is in the seed (you can edit them through the same editor)

### Files touched

| File | Change |
|---|---|
| `supabase/migrations/<ts>_subscription_plans_admin_editable.sql` | NEW — add columns, RLS policies, seed 6 current plans |
| `src/hooks/useSubscriptionPlans.ts` | NEW — fetch + cache plans by audience |
| `src/components/admin/subscription/PlanManagerDrawer.tsx` | NEW — admin editor drawer |
| `src/components/admin/subscription/PlanForm.tsx` | NEW — single-plan edit form with features list |
| `src/pages/subscription/SubscriptionPage.tsx` | Replace hardcoded arrays with hook; add admin "Manage Plans" button; null-safe price formatting |

### Acceptance test

1. As **admin** → `/subscription` → "Manage Plans" button appears top-right
2. Click it → drawer opens with Family / Professional tabs; current 6 plans listed in the same order/text as today
3. Edit **Active Care Management** weekly price `699 → 750`, save → toast "Plan updated"; the card behind the drawer immediately reflects `$750/week`
4. Toggle billing-cycle to Monthly → shows the unedited `$2,499/month` (independent monthly value)
5. Add a new feature row "Quarterly care strategy review" with `included: true`, `is_addon: true`, save → card shows it with the amber **Add-on** pill
6. Toggle a plan's **Active** off → card disappears for non-admins; still listed in the editor for admins
7. As **family user** → `/subscription` → no "Manage Plans" button; cards render exactly as the admin configured; weekly/monthly toggle still works
8. As **anonymous** → `/auth` redirect (unchanged)
9. RLS: opening DevTools → trying `update` on `subscription_plans` as a non-admin returns `permission denied`
10. Existing `user_subscriptions` rows (referencing `plan_id`) still resolve in `usePayPalSubscription.getUserSubscription()` — no broken FK

