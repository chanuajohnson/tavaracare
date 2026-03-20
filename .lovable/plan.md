

## Add Active Caregiver Matches Panel to User Journey Page

### What This Does

Adds a new "Active Caregiver Matches" card on the User Journey page (below the Family Journey Progress panel) that shows all assigned caregivers for the looked-up family user — with real-time updates via Supabase subscription.

### Current State

Ana Maria Aimey has 3 active matches:
- **Carlene Williams** (manual, score 70) — CNA, available
- **Daniella Walcott** (automatic, score 85) — GAPP, available
- **Tricia Cumm** (automatic, score 80) — GAPP, available
- Richard Singh — correctly deactivated

6 caregivers total are available for matching in the system.

### Build Error

The duplicate `data-lov-id` error is **not in the source files** — `src/main.tsx` and `src/App.tsx` are clean. This is the `lovable-tagger` build plugin running twice. No source fix possible; it resolves on re-deploy.

### Implementation

#### Create: `src/components/admin/ActiveCaregiverMatchesPanel.tsx`

A new component that:

1. **Fetches** from `caregiver_assignments` where `family_user_id = userId`, joining to `profiles` for caregiver name, type, location, and `available_for_matching` status
2. **Subscribes** to real-time changes on `caregiver_assignments` filtered by `family_user_id` — when a match is added, deactivated, or a caregiver's availability changes, the panel updates live
3. **Displays** a card with:
   - Count of active matches vs total available caregivers
   - Each active match as a row: name, type badge, score, assignment type (manual/automatic), availability indicator (green/red dot), date assigned
   - Inactive/deactivated matches shown in a collapsed "Previous Matches" section
4. **Color coding**: Green for active+available, amber for active but caregiver unavailable, gray for inactive

#### Modify: `src/pages/admin/UserJourneyPage.tsx`

- Import `ActiveCaregiverMatchesPanel`
- Render it after `FamilyJourneyProgressPanel` (only for family users):

```text
[JourneyVisualSummary]
[FamilyJourneyProgressPanel - collapsible 12 steps]
[ActiveCaregiverMatchesPanel - real-time matches]  ← NEW
[User Journey Timeline - event cards]
```

### Real-Time Strategy

Use Supabase `channel.on('postgres_changes', ...)` listening to `caregiver_assignments` table filtered by `family_user_id`. Also subscribe to `profiles` changes for `available_for_matching` updates on matched caregivers. On any change, refetch the full matches list.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Create | `src/components/admin/ActiveCaregiverMatchesPanel.tsx` | Real-time caregiver matches panel |
| Modify | `src/pages/admin/UserJourneyPage.tsx` | Add matches panel below journey progress |

