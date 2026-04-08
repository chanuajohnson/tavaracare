

## Fix: Denise's Screening Sessions Showing "Pending" Despite Claiming Completion

### What the Database Actually Shows

| Template | Status | Responses |
|----------|--------|-----------|
| Opening / Rapport | **reviewed** | 2 answers saved |
| Clinical Competency | **completed** | 4 answers saved |
| Team / Rotation Fit | **in_progress** | **empty []** |
| Reliability, Culture & Red-Flag Checks | **pending** | **empty []** |
| Cultural Sensitivity & Local Context | **pending** | **empty []** |
| Logistics, Transport & Professionalism | **pending** | **empty []** |

**Key finding**: The 3 "pending" sessions have **zero responses saved** and were never even opened (status never changed to `in_progress`). Team / Rotation Fit was opened but no answers were submitted.

### Root Cause

Denise likely completed the first two sessions, then when she clicked subsequent WhatsApp links, she was redirected to `/professional/screening` (the progress dashboard) because she was logged in. From there, clicking "Continue" on a pending session navigates to `/screening/:token` which works — but if she is clicking the **same old WhatsApp link** (for a completed session), she keeps getting redirected to the progress page and may think she completed everything.

**The code is working correctly** — the sessions genuinely were never answered. But there are two UX problems:

1. **No clear "Start Next" call-to-action** on the progress page to guide her to the next pending session
2. **WhatsApp nudge links always point to individual sessions** — if she re-clicks an old completed link, she loops back to the progress page without clarity on what to do next

### Plan: 2 Changes

#### 1. Add Auto-Navigation to Next Pending Session (MobileScreeningPage.tsx)

When a logged-in user opens a completed session link, instead of just redirecting to `/professional/screening`, automatically find the next pending session and offer to start it immediately with a clear prompt:

- After the redirect to `/professional/screening`, the landing page should highlight the next pending session prominently
- Add a banner at the top: "You have X sessions remaining — continue with [Template Name]" with a large "Start Now" button

**File**: `src/pages/professional/ProfessionalScreeningLandingPage.tsx`

#### 2. Improve the Progress Page UX to Surface Next Action

On the screening landing page, make the next pending session visually prominent:
- Auto-scroll or highlight the first incomplete session
- Add a sticky "Continue to Next Session" button at the bottom for mobile users
- Show a clear message: "3 of 6 sessions remaining"

**File**: `src/pages/professional/ProfessionalScreeningLandingPage.tsx`

### What This Does NOT Change
- The submission logic (it works correctly)
- The WhatsApp nudge flow
- The admin screening management UI
- No database changes needed

### Immediate Action for Denise
After these UX improvements, you should nudge Denise via WhatsApp with a link to one of her pending sessions (e.g., Reliability, Culture & Red-Flag Checks) so she can actually complete them. The 3 pending ones were genuinely never opened.

