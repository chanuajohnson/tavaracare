

## Add Smart Nudge Alerts to UserNudgeTab

### What This Does
When an admin opens a user's Nudge tab, it will show a contextual alert banner at the top indicating whether the user needs attention — based on when they were last nudged (via `admin_communications`) and their last platform activity (via `user_journey_progress.last_activity_at`).

### Alert Logic

| Condition | Alert Style | Message |
|-----------|-------------|---------|
| Never nudged | Red/destructive | "Never been nudged — consider sending a message" |
| Last nudged 7+ days ago | Amber/warning | "Last nudged X days ago" |
| Last nudged < 7 days ago | Green/muted | "Last nudged X days ago — recently contacted" |
| Inactive 3+ days + not nudged in 7 days | Red banner | "Inactive for X days and not nudged recently — action recommended" |

### Data Source
Query `admin_communications` for the most recent `sent_at` where `target_user_id = user.id`. Also use `user_journey_progress.last_activity_at` (already available via `journeyProgress`). No new tables needed — all data already exists.

### Implementation

#### 1. Modify `src/components/admin/UserNudgeTab.tsx`

- Add a `lastNudgedAt` state, fetched on mount from `admin_communications` (most recent `sent_at` for this user)
- Add an `Alert` component at the top of the tab (above "Recommended for this stage") showing the smart nudge status
- When "Send via WhatsApp" is clicked, also log to `admin_communications` so the alert updates on next view
- Update the `handleSendWhatsApp` function to insert an `admin_communications` record after opening WhatsApp

### UI Placement
```text
┌─────────────────────────────────────┐
│ ⚠ Inactive 5 days, never nudged    │  ← Smart alert (new)
│   Action recommended                │
├─────────────────────────────────────┤
│ Step 5 (42% complete) • 868-...     │  ← Existing context line
├─────────────────────────────────────┤
│ ✨ Recommended for this stage       │  ← Existing
│ ┌─────────────────────────────────┐ │
│ │ Family Legacy Story   [step_5] │ │
│ │ Hi Ana! ...                     │ │
│ │ [Send via WhatsApp]             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/admin/UserNudgeTab.tsx` | Add smart alert banner with last-nudged query + log sends to admin_communications |

