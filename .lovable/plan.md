## Goal

Make `account_status` actually **felt** by the user. Right now we record the status (banned, free_only, limited) on the profile and show admin badges, but nothing gates the user's session or dashboard — so banning Chanua looks like a no-op from her side, and Ana on `free_only` won't see a meaningfully different experience either.

This plan adds enforcement in three scoped layers, without touching the protected `AuthProvider` core logic.

---

## 1. Login / session enforcement (banned + deleted)

Add a thin **AccountStatusGate** component that wraps the authenticated app shell (mounted in `App.tsx` *inside* the existing routes, not replacing routing — guardrail-safe).

- On mount + on auth state change, fetch `profiles.account_status, account_status_reason` for `user.id`.
- If `banned` or `deleted`:
  - Immediately call `supabase.auth.signOut()`.
  - Redirect to `/auth?suspended=1`.
  - On `/auth`, show a red "Account suspended — contact support" card with the reason and a WhatsApp link to 1-868-786-5357.
- If `limited`: allow render but set a global `AccountStatusContext` so feature components can switch to read-only.
- If `free_only` or `active`: pass through.

This avoids editing `AuthProvider` itself — the gate is a sibling consumer.

## 2. Family dashboard differentiation (free_only)

`FreePlanReturnBanner` already renders for `free_only`. Extend the family dashboard to also **hide / lock** subscription-only surfaces when status is `free_only`:

- Hide: caregiver match list CTAs, "Schedule Visit" booking, professional chat composer.
- Replace each with a soft locked-card: "Paused — restart matching to reopen" + same `Restart Matching` CTA.
- Keep visible: profile, care plan (read-only), legacy story, support, billing.

A single `useAccountStatus()` hook (reads from the context above) drives the gating — no scattered DB calls.

## 3. Limited mode (read-only)

Same hook exposes `isReadOnly`. Wrap mutating buttons (Save, Submit, Send, Book) in a small `<WriteGuard>` that disables them and shows a tooltip "Account is in read-only mode" when `limited`.

Scope for this pass: family dashboard write actions only. Professional/admin write-guard can be a follow-up.

---

## Verification (Chanua's case)

After implementation:
1. Admin bans `chanuajohnson@gmail.com` → row updates, audit log row inserted (already working).
2. Chanua's open tab: within ~1s the gate sees the new status on next auth tick → signs her out → lands on `/auth?suspended=1` with the reason "Test Ban".
3. Fresh login attempt: sign-in succeeds at Supabase auth, but the gate immediately signs out and shows the suspended card. (True auth-level block requires Supabase admin `ban_user` API in an edge function — optional Phase 2 below.)

## Optional Phase 2 (auth-level hard ban)

Add edge function `admin-ban-user` that calls `supabase.auth.admin.updateUserById(id, { ban_duration: '876000h' })` so the user can't even obtain a session. Wire `useUserAccountStatus.applyAction` to call it for `ban_user` and `restore_active`. Recommended but separable.

---

## Files to add / edit

**New**
- `src/components/auth/AccountStatusGate.tsx` — fetch + redirect/signout logic
- `src/contexts/AccountStatusContext.tsx` — `{ status, reason, isReadOnly, isFreeOnly, isBanned }`
- `src/hooks/useAccountStatus.ts` — consumer hook
- `src/components/common/WriteGuard.tsx` — disables children when read-only
- `src/components/family/dashboard/LockedFeatureCard.tsx` — reusable "Paused" card
- (Phase 2) `supabase/functions/admin-ban-user/index.ts`

**Edit (scoped, guardrail-safe)**
- `src/App.tsx` — mount `<AccountStatusGate>` *inside* the existing authenticated layout, no route changes
- `src/pages/auth/Auth.tsx` (or equivalent) — render suspended card when `?suspended=1`
- `src/pages/dashboard/family.tsx` — wrap subscription surfaces with `isFreeOnly` check + `LockedFeatureCard`
- `src/hooks/admin/useUserAccountStatus.ts` — (Phase 2) call edge function

**Untouched (per guardrails)**
- `AuthProvider`, route tree, registration flow files

---

## Open question before I implement

Do you want **Phase 2 (true Supabase auth-level ban via edge function)** in this same pass, or ship Phase 1 (in-app gate + dashboard differentiation) first and test with Chanua / Ana, then add the hard ban?