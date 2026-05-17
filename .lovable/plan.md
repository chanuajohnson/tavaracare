## Goal

The admin "User Management" cards already open a `UserDetailModal` with an existing **Activity** tab. Today that tab only shows content for professionals (shifts/feed). For all other roles it shows a placeholder. The user wants the same kind of login + device + activity info we surfaced for Ana Maria Aimey to be visible here, for every user.

## Scope (frontend only)

Only `src/components/admin/UserDetailModal.tsx` and one new presentational component. No DB changes, no changes to other admin tabs, cards, routing, or core files.

## What the Activity tab will show

A new role-agnostic `UserActivityPanel` rendered in the existing Activity tab, with three stacked sections:

1. **Last Login & Device**
   - Most recent `session_analytics` row for `user_id`
   - Fields: last sign-in timestamp (relative + absolute), device_type, browser, referrer, exit_page
   - Fallback: "No session data recorded yet"

2. **Login History** (collapsible, last 10 sessions)
   - From `session_analytics` ordered by `started_at desc limit 10`
   - Columns: Started at · Duration · Device · Browser · Page views · Exit page

3. **Recent Activity Trail** (last 25 events)
   - From `cta_engagement_tracking` ordered by `created_at desc limit 25`
   - Columns: Timestamp · Feature · Action · session_id (short)
   - Groups consecutive events from the same `session_id` visually

For `professional` role, keep the current `ProfessionalActivityTab` (shifts/feed/compliance) ABOVE the new panel — do not remove existing functionality. The new `UserActivityPanel` renders for all roles below it.

## Technical details

- New file: `src/components/admin/UserActivityPanel.tsx`
  - Props: `{ userId: string; userFullName?: string }`
  - Uses `supabase` client directly with two queries (parallel via `Promise.all`):
    - `from('session_analytics').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(10)`
    - `from('cta_engagement_tracking').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(25)`
  - Loading skeleton, empty states, error toast
  - Uses existing shadcn `Card`, `Table`, `Badge`, `Collapsible`
  - Date formatting via existing `date-fns` (already in project) — `formatDistanceToNow` + `format`

- Edit `src/components/admin/UserDetailModal.tsx` lines 1016-1035:
  - Always render `<UserActivityPanel userId={user.id} userFullName={user.full_name} />`
  - For professionals, render `<ProfessionalActivityTab .../>` first, then the new panel
  - Remove the "Activity tracking is available for professional accounts" placeholder

## Out of scope

- No changes to `RoleBasedUserGrid` card layout
- No new top-level admin tab
- No backend/RLS changes (both tables are already readable by admins; if RLS blocks reads we will surface the error and stop — no policy edits in this pass)
- No edits to protected core files (App.tsx, AuthProvider, routing, registration pages)

## Verification

After implementing, open `/dashboard/admin` → User Management → click Ana Maria Aimey's card → Activity tab. Confirm:
- Last login shows April 12, 2026 ~19:48 UTC, Desktop / Windows / Chrome
- Login history lists her sessions
- Activity trail lists dashboard → care management → care plans → care assessment → registration edit

Then open a professional (e.g. Tricia Cumm) and confirm both `ProfessionalActivityTab` and the new panel render together.
