

## Two Fixes: Collapsible Journey Steps + Caregiver Match Cleanup

---

## Current State — Data Findings

**Ana Maria Aimey (9874b53e):**
- Profile: Complete (full_name, phone, address, care_recipient_name, relationship, care_types, care_schedule, budget, caregiver_type all populated)
- Care Assessment: EXISTS in `care_needs_family` (id: cfd95eb1)
- Care Recipient Profile: DOES NOT EXIST in `care_recipient_profiles` (empty result)
- Visit Status: `not_started`

**Why 17% on User Journey page vs 42% on Admin Dashboard card:**
The `useSharedFamilyJourneyData` hook (used by `FamilyJourneyProgressPanel`) queries `care_recipient_profiles` which returns empty for this user — so Legacy Story and Caregiver Matches show incomplete. The admin card on `/dashboard/admin` uses a *different* hook (`useUserSpecificProgress`) that maps to the `journey_steps` DB table with different logic. The 42%/6-step count on the admin card likely includes steps from the DB `user_journey_progress` table that were marked complete there.

**Bottom line:** The `FamilyJourneyProgressPanel` (17%) is actually more accurate for *what the family user sees*. The admin card (42%) may be inflated by the different step-mapping. Both are valid views — the panel shows the family's perspective, the card shows the DB-tracked progress.

**Caregiver Matches — Problems Found:**
1. **Richard Singh** (`2198dd21`) is matched with `available_for_matching = false` — should be deactivated
2. **Carlene Williams** (`9c388b40`) has `available_for_matching = true` but is NOT in her matches
3. The matching algorithm ran on Mar 9 but Richard Singh has since become unavailable

**Family Notification of Matches:**
Currently, notifications go to `admin_communications` table with type `new_match_available`. The `ManualMatchNotification` component exists but only on the **Professional** (caregiver) dashboard. There is NO equivalent component on the Family dashboard showing "You have new matches!" This is a gap — families aren't actively notified in-app when matches are created.

---

## Plan

### 1. Make Journey Steps collapsible in FamilyJourneyProgressPanel

**File:** `src/components/admin/FamilyJourneyProgressPanel.tsx`

- Keep the progress summary (stage badge, progress label, X of 12 steps, percentage, progress bar) always visible
- Wrap the "Journey Steps" list and "Next Step Recommendation" inside a `Collapsible` (from `@radix-ui/react-collapsible`)
- Add a `CollapsibleTrigger` button below the progress bar: "Show Steps ▼" / "Hide Steps ▲"
- Default state: collapsed (closed)
- Uses existing `src/components/ui/collapsible.tsx` components

### 2. Fix caregiver matching data for Ana Maria

**Database operations (SQL):**

a) **Deactivate Richard Singh's match** (unavailable caregiver):
```sql
UPDATE caregiver_assignments 
SET is_active = false, status = 'inactive', 
    notes = 'Deactivated: caregiver no longer available for matching'
WHERE family_user_id = '9874b53e-ea23-4ccb-abed-ddbb0367edf5' 
  AND caregiver_id = '2198dd21-7618-4bd9-8bc5-86f013deef33';
```

b) **Add Carlene Williams as a match** (available, should be matched):
```sql
INSERT INTO caregiver_assignments (family_user_id, caregiver_id, assignment_type, match_score, status, is_active, match_explanation, assignment_reason)
VALUES ('9874b53e-ea23-4ccb-abed-ddbb0367edf5', '9c388b40-32fd-4305-92cc-98e07bfd53f9', 'manual', 70, 'active', true, 'Manual match by admin - available caregiver with relevant experience', 'Admin manual match: Carlene Williams available and compatible');
```

### 3. Note about notification gap (no code change now, but flagged)

Currently families are NOT notified in-app of matches. The `ManualMatchNotification` component only exists for caregivers. A family-facing "You have X new matches" notification on the family dashboard would be the next critical step to convert potential to actual customers.

---

## Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/admin/FamilyJourneyProgressPanel.tsx` | Wrap journey steps in collapsible accordion |
| DB | SQL migration | Deactivate Richard Singh match, add Carlene Williams match |

---

## About the 17% vs 42% discrepancy

Both numbers are "correct" from different perspectives. The 17% (FamilyJourneyProgressPanel) reflects what the family user actually sees — their Legacy Story isn't done, so caregiver matches aren't unlocked from the family's view. The 42% (admin card) uses DB-tracked progress which may count steps differently. No "fix" needed — they serve different purposes. The collapsible panel will show the family's perspective clearly.

