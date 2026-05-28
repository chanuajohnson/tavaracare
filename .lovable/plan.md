## Goal
On `/admin/blog/analytics` → Acquisition funnel card, make the "Registration completed" row clickable so admins can see exactly which users make up that count (e.g. the "2" you're seeing while Supabase Auth list looks empty).

## Scope (one file)
`src/components/admin/blog-analytics/AcquisitionFunnelCard.tsx` only. No schema changes, no route changes, no other cards touched.

## What changes

1. **Add a small "View users" link** next to the count on the "Registration completed" row (only when count > 0, and respecting the current Combined / Family / Professional tab).

2. **Click opens a shadcn `Dialog`** that lists the users behind that number. For each user show:
   - Full name (from `profiles.full_name`)
   - Role badge (family / professional / community)
   - Registration completion timestamp (from the `*_registration_complete` event)
   - User ID (short, monospace, copyable)
   - Email if available on the profile

3. **Data source** — two-step client query, no new RPC:
   - From the events already in the card's `events` prop, filter to `family_registration_complete | professional_registration_complete | community_registration_complete` matching the active role tab, and collect their `user_id`s + timestamps.
   - Fetch matching rows from `profiles` with a single `supabase.from('profiles').select('id, full_name, email, role').in('id', ids)` call (only when the dialog opens — lazy).
   - Join in-memory and render. If a `user_id` has no matching profile row, still show it with "(profile not found)" so the discrepancy with Supabase Auth becomes visible.

4. **Why this explains your "2 but no new users in Supabase"**:
   - The funnel counts the **event** (form completion), not auth signups. The account may have been created days earlier; only the profile form was completed in the window.
   - The dialog will make this obvious: timestamps + names + role, side by side. You'll immediately recognize Shania / Jennelle from last session.

## Out of scope
- Filtering the funnel to "blog/UTM-attributed only" (separate change if you want it next).
- Any change to `App.tsx`, routing, AuthProvider, chat flow, or registration pages.
- Any new tables, RLS, or edge functions.

## Acceptance
- "Registration completed" row shows a `View users` link when count > 0.
- Clicking it opens a dialog listing N users where N === the row count for the active tab.
- Dialog respects the Combined / Family / Professional tab.
- Empty state ("No users in this window") shown if count is 0 (link hidden in that case).
- No regressions to existing funnel bars, percentages, or biggest-leak line.
