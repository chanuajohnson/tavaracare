

## Plan: Replace Hardcoded `tavaracare.lovable.app` URLs with Dynamic Production Domain

### Problem
All WhatsApp nudge messages and "Copy Link" buttons hardcode `https://tavaracare.lovable.app` as the domain. When these links are shared to users (like Denise), they point to the Lovable preview domain instead of the live production domain `https://tavara.care`.

### Solution
Create a shared utility constant for the production base URL (`https://tavara.care`) and replace all hardcoded `tavaracare.lovable.app` references across WhatsApp message builders, copy-link buttons, and other user-facing URLs.

For WhatsApp messages (which are composed in the admin panel but sent externally), we use the fixed production domain `https://tavara.care` — not `window.location.origin` — because the admin may be on a preview/dev URL but the links must always point to production for the end user.

### Files to modify

| File | What changes |
|------|-------------|
| `src/utils/urlConstants.ts` | **New file** — export `PRODUCTION_BASE_URL = "https://tavara.care"` |
| `src/components/admin/UserNudgeTab.tsx` | Replace all `https://tavaracare.lovable.app` with `PRODUCTION_BASE_URL` (~12 occurrences across all nudge builders) |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Replace `publishedBase = "https://tavaracare.lovable.app"` with `PRODUCTION_BASE_URL` for copy-link buttons |
| `src/components/admin/UserMatchingActions.tsx` | Replace hardcoded URL in deactivation message |
| `src/components/professional/DailyChecklist.tsx` | Replace hardcoded URL in daily log summary link |
| `src/services/care-plans/invoiceService.ts` | Replace hardcoded website URL in invoice config |
| `src/components/care-plan/ShareScheduleModal.tsx` | Already uses `window.location.origin` — no change needed |
| `src/components/marketing/CaregiverShareCard.tsx` | Replace hardcoded URL in QR code |
| `src/components/professional/profile/AdminAssistantCard.tsx` | Replace hardcoded PDF download URLs (these are static assets, may need separate handling) |

### Technical detail
- A single `PRODUCTION_BASE_URL` constant ensures one place to update if the domain ever changes
- WhatsApp messages and external-facing links always use the production domain regardless of where the admin is logged in
- PDF document links (Nurse Handbook, Daily Checklist) in `AdminAssistantCard.tsx` and `DailyChecklist.tsx` point to `/documents/` — these will also use the production base URL

