

## Fix: Screening Step Status + Landing Page Progress

### Problem Summary

**Issue 1: Dashboard always shows "Awaiting Screening"**
Step 6 checks `professional_screening` table for `screening_type = 'head_nurse_interview' AND status = 'passed'`. But actual screening happens in the `screening_sessions` table. These are different tables -- so even when Tricia has active/completed sessions, step 6 never reflects that.

**Issue 2: Landing page shows generic "Your Screening Is Ready"**
The `/professional/screening` page fetches only 1 session (`limit(1)`) and shows a static card. It doesn't show:
- Which templates have been completed vs pending
- Overall screening progress (e.g., "2 of 6 completed")
- A way to continue the next pending session

**Issue 3: No defined flow for "all screening complete"**
When all assigned screening templates are done, there's no celebration state or next-step guidance.

### Solution

#### 1. Fix Step 6 completion logic in `useEnhancedProfessionalProgress.ts`

Query `screening_sessions` instead of (or in addition to) `professional_screening`:

```
- Check if ANY screening_sessions exist for the user
- If all sessions have status 'completed' or 'reviewed' → step completed
- If some are in_progress/pending → step in-progress (show "Continue Screening")
- If none exist → "Awaiting Screening"
```

Update button text logic for step 6:
- No sessions: "Awaiting Screening" (current)
- Has pending/in_progress: "Continue Screening →"
- All completed: "✓ Screening Complete"

Also apply the same fix in `useProfessionalProgress.ts` (the TAV demo hook).

#### 2. Redesign `ProfessionalScreeningLandingPage.tsx`

Replace the single-session view with a **multi-session progress view**:

- Fetch ALL `screening_sessions` for the user (not `limit(1)`)
- Show a progress summary: "Completed 2 of 4 screening questionnaires"
- List each session as a card showing:
  - Template name (from `screening_question_templates`)
  - Status badge (Pending / In Progress / Completed)
  - Question count
  - "Begin" or "Continue" button for pending/in_progress sessions
- Keep the "Before you begin" tips section at the top (shown once)
- When ALL sessions are completed, show a celebration card: "All Screenings Complete! The Tavara team is reviewing your responses and will notify you when your profile is cleared."

#### 3. Update step 6 link

Currently links to `/professional/screening`. This is correct -- the landing page itself will now handle showing progress and routing to the right session.

### Files to Change

| File | Change |
|------|--------|
| `src/hooks/useEnhancedProfessionalProgress.ts` | Query `screening_sessions` table; update step 6 completion + button text logic |
| `src/components/tav/hooks/useProfessionalProgress.ts` | Same screening_sessions query fix |
| `src/pages/professional/ProfessionalScreeningLandingPage.tsx` | Full rewrite: multi-session progress view with per-template cards |
| `src/hooks/professional/stepDefinitions.ts` | Update step 6 button text cases for "Continue Screening" |

