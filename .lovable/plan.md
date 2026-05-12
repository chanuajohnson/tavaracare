## What's missing

When you set Chanua to **Limited Access** with a reason, the data is being saved (and the admin badge shows it), but **nothing renders on her dashboard** because:

- `AccountStatusGate` only redirects on `banned`/`deleted`. For `limited` it silently sets `isLimited` / `isReadOnly` flags — but no UI consumes them yet.
- `FreePlanReturnBanner` only renders when `account_status === 'free_only'`, so it ignores `limited`.

Result: Chanua sees her normal Family Dashboard with no indication that her access has changed or why.

## Plan — add a Limited Access banner (UI-only, guardrail-safe)

### 1. New component: `src/components/family/dashboard/LimitedAccessBanner.tsx`

Reads from `useAccountStatus()` (already in context via `AccountStatusGate`). Renders only when `status === 'limited'`.

- Amber/orange tone (matches the admin badge color for `limited`)
- Lock icon + heading: "Your account is in limited access"
- Body shows the **reason** the admin entered (`reason` from context), wrapped in a quoted block so it's clearly the coordinator's note
- Two actions:
  - "Talk to Coordinator" → `/support`
  - WhatsApp link to central number `18687865357` pre-filled with: `Hi Tavara, my account is in limited access. Reason given: "<reason>". Can we talk?`
- Uses semantic tokens only (`bg-amber-50`, `border-amber-200`, `text-amber-900` mapped via existing palette / or `bg-warning` tokens if present — will mirror the existing `STATUS_BADGE` styling pattern from `RoleBasedUserGrid`)

### 2. Mount it in `src/pages/dashboard/family.tsx`

Place it directly **above** `<FreePlanReturnBanner />` (line ~76). Both components self-gate on status, so only one will ever render at a time.

### 3. (Optional, ask before doing) — read-only enforcement

The gate already exposes `isReadOnly`. We could wire it into mutating buttons (Save, Submit, Send) on the family dashboard so they're visibly disabled with a tooltip. **Not in this pass** unless you confirm — that touches more components and the guardrail says scope UI-only changes narrowly.

## What this does NOT change

- No edits to `App.tsx`, `AuthProvider`, routing, or registration files
- No DB schema changes
- No edits to the admin side (badge + reason already work)
- Professional / community dashboards untouched (Chanua is a family user)

## Verification steps after implementation

1. Reload Chanua's `/dashboard/family` — amber banner appears at top with the reason you typed
2. Restore her to Active from admin — banner disappears on next route change (gate refetches)
3. Switch her to `free_only` — limited banner hides, free-plan banner appears instead