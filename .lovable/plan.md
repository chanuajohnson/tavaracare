

## Fix: Missing Professionals + Resubmission Message Clarity

### Issue 1: Missing Professionals (e.g., Denise)

The "All Professionals" panel in `ProfessionalScreeningPanel.tsx` queries `profiles` table filtered by `role = 'professional'`. It shows only 5 results. Missing professionals either:
- Have a different role value in their profile
- Are blocked by RLS policies on the `profiles` table

The `ScreeningSessionManager` candidate dropdown has the same query (`profiles.role = 'professional'`), so both lists share this limitation.

**Fix**: The panel already uses the admin's authenticated context. The `admin_get_all_profiles_secure` RPC function (used in `useAdminProfiles`) bypasses RLS and returns all profiles. We should reuse this pattern — either use the hook directly or call the same RPC — so the admin sees ALL professionals regardless of RLS restrictions.

**Changes to `ProfessionalScreeningPanel.tsx`**:
- Replace direct `profiles` table query with `supabase.rpc('admin_get_all_profiles_secure')` filtered client-side for `role = 'professional'`
- This ensures all professionals are visible to the admin

**Changes to `ScreeningSessionManager.tsx`**:
- Same fix for the candidates dropdown — use the RPC instead of direct table query

### Issue 2: Resubmission WhatsApp Message is Generic

Currently `handleNudgeResubmit` calls the same `onSendScreening` callback, which uses a generic "finalize the evaluation" message. The recipient has no idea this is a redo.

**Fix**: Add a separate `onResendScreening` prop or modify the existing callback to accept a `isResubmission` flag. Update `ProfessionalScreeningPage.tsx` to compose a different WhatsApp message for resubmissions.

**Changes to `ProfessionalScreeningPage.tsx`**:
- Add a `handleResendScreening` function with a resubmission-specific message:
  > "Hi! It's the Tavara Team. We'd like to kindly ask you to redo the screening questionnaire for [Name]. We noticed a few areas we'd love more detail on before we proceed. Please tap the link below to complete a fresh set of questions: [link]. Thank you for your patience!"

**Changes to `ScreeningSessionManager.tsx`**:
- Add `onResendScreening` prop (optional)
- In `handleNudgeResubmit`, call `onResendScreening` instead of `onSendScreening`
- In `handleResendScreening` (the existing resend-link button), also use the appropriate callback

### Technical Summary

| File | Change |
|------|--------|
| `ProfessionalScreeningPanel.tsx` | Replace `profiles` query with `admin_get_all_profiles_secure` RPC |
| `ScreeningSessionManager.tsx` | Replace `profiles` query with RPC; add `onResendScreening` prop for nudge flow |
| `ProfessionalScreeningPage.tsx` | Add `handleResendScreening` with resubmission-specific WhatsApp message; pass as prop |

