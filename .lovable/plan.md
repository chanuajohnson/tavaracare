

## Fix Navigation for Match & Visit Steps on Family Dashboard

### Problems Found

1. **"View your matches" link** in `FamilyMatchNotification` — uses `scrollToMatches()` which looks for `id="family-caregiver-matches"` element. **That id doesn't exist anywhere** in the rendered DOM, so clicking does nothing.

2. **"View Matches" button** on Step 4 (See Your Instant Caregiver Matches) in the journey panel — the action switch only handles cases 1, 2, 3. Step 4+ all hit `default: console.log('No navigation defined')`.

3. **"Visit Scheduled" button** on Step 7 (Schedule Your Tavara.Care Visit) — same issue, no case defined.

4. Both switch blocks in `useEnhancedJourneyProgress.ts` (lines 408-429 and 469-490) are identical and both missing cases 4-12.

### What Each Navigation Should Do

| Step | Action | Navigation Target |
|------|--------|------------------|
| 4 - See Caregiver Matches | Open match browser or scroll to matches | `/caregiver/matching` (existing route) |
| 5 - Medication Management | Go to medication setup | `/family/care-management/:carePlanId/medications` or trigger care plan creation |
| 6 - Meal Management | Go to meal setup | `/family/care-management/:carePlanId/meals` or trigger care plan creation |
| 7 - Schedule Visit | Open the ScheduleVisitModal already wired in the page | Trigger `setShowScheduleModal(true)` via the hook |
| 8 - Confirm Visit | Same schedule flow | Same as step 7 |

### User Flow After Matching

Once Ana Maria has matches, her path is:
1. **View matches** → Browse caregivers, chat with them (TAV-guided chat modal)
2. **Schedule a visit** → Choose a caregiver, pick virtual (free) or in-person ($300 TTD)
3. **Admin confirms** → "Admin will contact you within 24 hours" banner appears
4. **Trial day** → Optional paid trial ($320 TTD)
5. **Subscribe** → Convert to ongoing care

### Implementation

#### 1. Fix `FamilyMatchNotification` — "View your matches" link

Change `scrollToMatches` to use `useNavigate` and go to `/caregiver/matching`. This is the existing page that shows all matches with full browsing, chat, and detail capabilities. As a fallback, also try scroll if on the same page.

**File:** `src/components/family/FamilyMatchNotification.tsx`
- Add `useNavigate` import
- Change `scrollToMatches` to navigate to `/caregiver/matching`

#### 2. Add missing step navigation cases in `useEnhancedJourneyProgress.ts`

Add cases 4-8 in **both** switch blocks (lines 408-429 and 469-490):

- **Case 4** (See Caregiver Matches): `navigate('/caregiver/matching')`
- **Case 5** (Medication Management): `navigate('/family/care-management')` — let the care management page handle plan selection
- **Case 6** (Meal Management): `navigate('/family/care-management')` — same
- **Case 7** (Schedule Visit): `setShowScheduleModal(true)` — use the existing modal state already exposed by the hook
- **Case 8** (Confirm Visit): `navigate('/dashboard/family')` with a toast "Check your visit status"

**File:** `src/hooks/useEnhancedJourneyProgress.ts`

#### 3. Add anchor id to `FamilyReadinessChecker` wrapper in `FamilyDashboard.tsx`

Add `id="family-caregiver-matches"` to the div wrapping `<FamilyReadinessChecker />` so scroll-based navigation also works as a fallback.

**File:** `src/components/family/FamilyDashboard.tsx` — line ~301

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/family/FamilyMatchNotification.tsx` | Navigate to /caregiver/matching instead of broken scroll |
| Modify | `src/hooks/useEnhancedJourneyProgress.ts` | Add cases 4-8 in both switch blocks |
| Modify | `src/components/family/FamilyDashboard.tsx` | Add anchor id for scroll fallback |

### Admin Context — Two Visit States You See

- **Ana Maria on `/dashboard/admin`**: Shows "Scheduling" status, 42% — this comes from `user_journey_progress` DB table which tracks admin-side progress
- **"Admin will contact within 24 hours"**: This is the `ScheduleVisitModal` output — the visit was requested but awaits admin confirmation via `/admin/visit-schedule`

Both are correct representations of the same state from different perspectives.

