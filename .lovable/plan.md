

## Update Quick Access Bar: Add Legacy Story + Conditional Care Management

### Problem

1. **Legacy Story** button should always appear in Quick Access when the user hasn't completed it — currently it's there but positioned after Schedule Care. It should be more prominent.
2. **Care Management** button shows unconditionally — it should only appear once the user is past the scheduling stage (visit scheduled), since it's not relevant before that.

### Changes

#### Modify: `src/components/family/FamilyShortcutMenuBar.tsx`

1. **Move Legacy Story button** right after Schedule Care (or after View Matches if scheduling isn't showing yet) — keep its blue styling so it stands out as an action item.

2. **Make Care Management conditional**: Only show when `isVisitScheduled` is true (user has passed scheduling). This declutters the bar during earlier stages.

**Button order becomes:**
- Schedule Care (amber, if in scheduling stage)
- View Caregiver Matches (if applicable)
- Share Loved One's Story (blue, if not completed)
- Edit Profile (outline)
- Edit Assessment (outline)
- Care Management (outline, **only after visit scheduled**)
- Visit Scheduled (green, if scheduled)

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/family/FamilyShortcutMenuBar.tsx` | Reorder buttons, make Care Management conditional on `isVisitScheduled` |

