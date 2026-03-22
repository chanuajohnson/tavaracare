

## Fix Schedule Redirect, Enhance Deactivation Flow, and Add Unavailability Nudge

### Problems
1. **Schedule button does nothing**: `handleScheduleVisit` just shows a toast with "Redirecting to visit scheduling..." but never navigates — it's a TODO stub.
2. **No post-deactivation workflow**: When admin deactivates a caregiver (e.g., Carlene), there's no option to suggest the next best match or notify the family.
3. **No "caregiver unavailable" nudge template**: Admin needs a template to notify families when a matched caregiver becomes unavailable.

### Changes

#### 1. Fix Schedule button redirect (`src/components/admin/UserMatchingActions.tsx`)
- Import `useNavigate` from react-router-dom
- In `handleScheduleVisit`, navigate to `/admin/visit-schedule` with the family user ID and caregiver info as query params or state
- The admin scheduling page already exists and supports preselected users

#### 2. Enhance Deactivate flow (`src/components/admin/UserMatchingActions.tsx`)
- Replace the instant deactivate with a confirmation dialog that includes:
  - A checkbox: "Suggest next best available match" (checked by default)
  - A checkbox: "Send unavailability nudge to family" (checked by default)
- On confirm:
  - Deactivate the assignment as before
  - If "suggest next best" is checked: open the Manual Match interface automatically so admin can assign the replacement
  - If "send nudge" is checked: open WhatsApp with the pre-filled unavailability message to the family's phone

#### 3. Add "Caregiver Unavailable" nudge template (database insert)
New template in `nudge_templates`:
- **Name**: "Caregiver Unavailable - Next Match"
- **Role**: `family`
- **Stage**: `caregiver_change`
- **Message**:
  > Hi [Name]! 💙 Chan from Tavara Care.
  >
  > We wanted to let you know that one of your matched caregivers is temporarily unavailable. Don't worry — we've already identified your next best match and are working to get them assigned.
  >
  > Our admin team will be in touch shortly with your updated care team details.
  >
  > 🔗 View your matches: https://tavaracare.lovable.app/family/matching
  >
  > Need to talk? Just reply here and we'll help right away!
  > - Chan, Tavara Care 💙

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/admin/UserMatchingActions.tsx` | Fix schedule redirect to `/admin/visit-schedule`; add deactivation confirmation dialog with "suggest next match" and "send nudge" checkboxes |
| Insert | `nudge_templates` (database) | 1 new "Caregiver Unavailable" family nudge template |

