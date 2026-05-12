## Goal

Three connected admin actions:
1. Revert Ana Maria Aimey to the Free plan and log why (trust break after nurse incident).
2. Raise the price of "Caregiver Matching & Placement" to $1,399.00 one-time.
3. Add reusable admin controls (Ban, Limit Access, Move to Free) next to Delete User on every user card, plus a welcoming "return" state on Ana's dashboard.

---

## Part 1 — Ana's status today (verified from DB)

- Profile: `Ana Maria Aimey` · id `9874b53e-…` · role `family` · onboarding_stage `registration` · `available_for_matching = false`.
- `user_subscriptions`: **no active row** — she is not on any paid plan in the database right now. The "Scheduling 50% Complete" badge on her card reflects onboarding progress, not billing.
- So "reverting to Free" is really: explicitly attach her to the **Family Basic (Free)** plan so the system, her dashboard, and admin views all reflect that intentionally — and lock her out of paid-only features (matching, active care management) until she resubscribes.

### What Free / Basic gives her (kept)
- Profile, care recipient info, care plan viewing
- TAV chat support, community resources, educational tools
- Ability to log back in, view legacy story, view past care logs
- Access to repurchase Caregiver Matching & Placement one-time when ready

### What she loses (removed on revert)
- Active caregiver matching pool visibility (`available_for_matching` stays false)
- Care team assignment / shift coverage workflows
- Payroll, NIS, daily care SOP monitoring
- Premium scheduling banner CTAs
- Any auto-nudges tied to active subscription

---

## Part 2 — Pricing update

Update `billable_service_items` row `Caregiver Matching & Placement` (id `13e84679-a950-4ef3-9658-71ac41a5a3ec`):
- `unit_price`: 299.00 → **1399.00**
- Description stays: "Caregiver matching, vetting, and introduction coordination."

This flows automatically into:
- Lifecycle Cost dashboard (`useLifecycleCost`)
- Admin onboarding checklist service components
- Family-facing pricing references

---

## Part 3 — Admin user-card controls (replace the lone Delete button)

On `RoleBasedUserGrid` family/professional cards, change the single "Delete User" button into an action menu:

```text
[ Manage ▾ ]
  • Move to Free Plan
  • Limit Access (read-only)
  • Ban User
  • ─────────
  • Delete User  (destructive, confirm)
```

Each action writes to a new `admin_user_actions` log table and updates a new `account_status` field on `profiles`:

- `account_status` enum: `active` | `free_only` | `limited` | `banned` | `deleted`
- `account_status_reason` text
- `account_status_changed_at` timestamp
- `account_status_changed_by` uuid (admin)

Effects:
- `free_only` → forces subscription to Family Basic, hides paid CTAs, shows "Welcome back" return banner.
- `limited` → read-only dashboard, no new bookings, no chat send.
- `banned` → blocks login via RLS + auth check, shows "Account suspended — contact support".
- `deleted` → existing soft-delete flow.

---

## Part 4 — Ana-specific logging & "return" experience

### Admin side (onboarding card + user detail modal)
Add a **Status & History** block on Ana's card showing:
- Badge: "Free Plan — Subscription Cancelled (12 May 2026)"
- Reason: "Trust concern after nurse early-departure incident on Fri 8 May. Family forfeited matching and cancelled active plan."
- Action By: admin name
- Note thread (extends existing onboarding note system)

Stored as one row in `admin_user_actions` + one row in onboarding notes tagged `cancellation`.

### Family side (Ana's dashboard)
When `account_status = 'free_only'` and previously had matching:
- Replace the Scheduling/amber CTA banner with a warm welcome card:
  - Title: "We're still here for you, Ana 💙"
  - Body: "Your active subscription is paused. Whenever you're ready, you can restart with a one-time Caregiver Matching & Placement ($1,399) and reactivate your weekly care management plan. We'd love to walk this next step with you."
  - Buttons: `Restart Matching` (links to billable services checkout) · `Talk to TAV` · `Message Coordinator`
- Keep her care recipient profile, legacy story, and chat available.
- Hide payroll, shift coverage, and team assignment tabs.

---

## Part 5 — Walkthrough: how you (admin) will do this

1. Open `/dashboard/admin` → find Ana's family card → click new **Manage ▾** → **Move to Free Plan**.
2. Modal asks for reason → paste the trust/nurse-incident summary → confirm.
3. System: cancels any active subscription rows, sets `account_status='free_only'`, writes `admin_user_actions` log, posts onboarding note, flips dashboard banner.
4. Separately, go to **Admin → Pricing / Billable Services** → edit *Caregiver Matching & Placement* → set $1,399 → save (one DB update, no code change beyond the existing editor).
5. Verify on Ana's family dashboard preview that the welcome-back card shows and paid features are hidden.

---

## Technical Section

**Migrations needed**
- `ALTER TABLE profiles ADD COLUMN account_status text DEFAULT 'active'`, plus reason / changed_at / changed_by columns.
- New table `admin_user_actions` (admin_id, target_user_id, action_type, reason, metadata jsonb, created_at) with RLS allowing only `has_role(auth.uid(),'admin')`.
- Update `unit_price` for `13e84679-a950-4ef3-9658-71ac41a5a3ec` to 1399.00 (data update, separate from schema migration).
- Optional: insert Ana's free-plan row into `user_subscriptions` referencing `8170faf7-…` (Family Basic) with status `active`.

**Frontend changes**
- `src/components/admin/RoleBasedUserGrid.tsx` — replace Delete button with DropdownMenu of 4 actions; add status badge.
- New `src/components/admin/user-actions/ManageUserMenu.tsx` housing the 4 action dialogs.
- New `src/hooks/admin/useUserAccountStatus.ts` for mutations + log writes.
- `src/components/admin/UserDetailModal.tsx` — show Status & History section, render `admin_user_actions` log.
- New `src/components/family/dashboard/FreePlanReturnBanner.tsx` — shown when `account_status='free_only'`.
- Family dashboard layout: gate paid tabs on `account_status === 'active'`.
- Auth guard: block login for `banned`; show read-only mode for `limited`.

**Guardrails respected**
- No edits to `App.tsx`, routing, AuthProvider, or `FamilyRegistration.tsx`.
- Chat flow engine and registration flows untouched.
- All new colors/styles use semantic tokens.

---

## Confirm before I build

Want me to (a) include all four actions (Move to Free, Limit, Ban, Delete) in this build, or start with just **Move to Free + cancellation logging for Ana**, then add Ban/Limit in a second pass?