

## Add Visual Journey Summary to User Journey Analytics Page

Add a compact, at-a-glance visual timeline at the top of the journey results (above the existing detailed cards) that shows the user's journey as a horizontal flow with key milestones.

---

## What You'll See

After looking up a user, a new summary section appears above the detailed timeline:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  👤 Ana Maria Aimey  |  Family  |  First seen: Mar 9  |  10 events │
│                                                                     │
│  ●─────────●─────────●─────────────────────●─────────●              │
│  Register  Assessment Milestone    (7 days)  Dashboard  Care Plan   │
│  Mar 9     Mar 9      Mar 9                  Mar 16     Mar 16      │
│                                                                     │
│  📱 Android/Chrome  |  🔄 2 sessions  |  ⏱ Last active: Mar 16    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation

### New Component: `src/components/admin/JourneyVisualSummary.tsx`

A compact card that takes the journey data array and renders:

1. **User info bar** — Name, role, first seen date, total events (fetched from profiles table using the user_id)
2. **Horizontal milestone timeline** — Color-coded dots connected by lines showing key actions in chronological order, grouped by date. Deduplicates repeated page views, highlights milestones
3. **Quick stats row** — Device info, number of sessions (grouped by date gaps), last active date, total time tracked

### Modify: `src/pages/admin/UserJourneyPage.tsx`

- Import `JourneyVisualSummary`
- After data is fetched, also fetch the user's profile (name, role, avatar)
- Render `<JourneyVisualSummary>` above the existing "User Journey Timeline" section
- No changes to existing timeline cards below

### Data Processing Logic

- Group events by date to identify sessions
- Deduplicate consecutive same-action events (e.g., 4 registration page views → "Registration (×4)")
- Extract key milestones: first registration, assessment, milestone achievements, dashboard access, care plan views
- Calculate session gaps and time-on-site estimates from `time_on_previous_page` data

### Color Coding

| Event Type | Color | Icon |
|-----------|-------|------|
| Registration | Blue | UserPlus |
| Assessment | Green | ClipboardCheck |
| Milestone | Gold | Star |
| Dashboard | Purple | LayoutDashboard |
| Care Plan | Teal | FileHeart |

### File Changes

| Action | File | Description |
|--------|------|-------------|
| Create | `src/components/admin/JourneyVisualSummary.tsx` | Visual timeline summary component |
| Modify | `src/pages/admin/UserJourneyPage.tsx` | Add profile fetch + render summary above existing timeline |

No existing UI is removed or changed — this is purely additive above the current detailed cards.

