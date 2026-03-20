

## What Ana Maria Sees Right Now — And the Gaps

### Current Family Dashboard Experience

Ana Maria's dashboard (`/dashboard/family`) has this flow:

1. **Journey Steps Panel** (`EnhancedFamilyNextStepsPanel`) — shows 17% progress, "Share Your Loved One's Story" as next step. Caregiver Matches step shows as **locked**.
2. **Readiness Checker** (`FamilyReadinessChecker`) — checks registration + assessment (story is optional). Ana Maria passes this gate, so she **does** see the `DashboardCaregiverMatches` component with her 3 active matches (Carlene Williams, Daniella Walcott, Tricia Cumm).

### The Disconnect

There's a contradictory UX:
- The **journey panel** (top of page) says "Caregiver Matches: Locked" at 17%
- The **readiness checker** (below) shows her matches because it only requires registration + assessment

So she CAN see matches, but the progress bar tells her she hasn't reached that point yet. Confusing.

### What's Missing — No Match Notifications

- `ManualMatchNotification` exists only on the **Professional** dashboard
- There is **no family-facing notification** when a new match is added (like Carlene Williams)
- No toast, no banner, no badge — the user has to scroll down to discover matches appeared
- This is the critical conversion gap you identified

### Proposed Fix — Two Changes

#### 1. Add `FamilyMatchNotification` banner to Family Dashboard

**Create: `src/components/family/FamilyMatchNotification.tsx`**

A notification banner that:
- Queries `caregiver_assignments` for the logged-in family user where `is_active = true`
- Subscribes to real-time changes (new matches appear instantly)
- Shows a dismissible banner at the top: "You have 3 caregiver matches! View your matches →"
- Highlights NEW matches (created in last 48 hours) with a "New" badge
- Click scrolls to or navigates to the matches section

**Modify: `src/components/family/FamilyDashboard.tsx`**

- Import and render `FamilyMatchNotification` above the `EnhancedFamilyNextStepsPanel` (after the shortcut menu bar)
- Only renders when user has active matches

#### 2. Fix journey panel to reflect actual readiness state

**Modify: `src/hooks/useSharedFamilyJourneyData.ts`** (or wherever the 12-step completion is calculated)

The "Caregiver Matches Unlocked" step currently requires `care_recipient_profiles` (story). But the actual readiness gate (`FamilyReadinessChecker`) only requires registration + assessment. Align them:
- Step 7 "Caregiver Matches Unlocked" should check: `registrationComplete && careAssessmentComplete` (matching the readiness checker)
- Story remains its own step but doesn't gate matches

This would bump Ana Maria from 17% (2/12) to ~25% (3/12) — still showing story as incomplete but matches as unlocked, matching what she actually sees.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Create | `src/components/family/FamilyMatchNotification.tsx` | Real-time match notification banner for families |
| Modify | `src/components/family/FamilyDashboard.tsx` | Add notification above journey panel |
| Modify | `src/hooks/useSharedFamilyJourneyData.ts` | Align "matches unlocked" step with actual readiness logic |

### Result After Fix

- Ana Maria sees: "You have 3 caregiver matches! View your matches →" banner
- Journey shows ~25% with matches step as completed
- New matches (like Carlene) trigger real-time notification
- Clear path from match → chat → schedule → trial → subscription

