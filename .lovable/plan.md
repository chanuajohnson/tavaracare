

## Add Family Journey Steps View to User Journey Analytics Page

Duplicate the Journey Progress panel from the `/dashboard/admin` UserDetailModal and place it on `/admin/user-journey` between the `JourneyVisualSummary` and the "User Journey Timeline" section.

---

## What Changes

### Modify: `src/pages/admin/UserJourneyPage.tsx`

1. Import `useSharedFamilyJourneyData` hook (same one used by UserDetailModal for family users)
2. Import UI components: `Progress`, `Badge`, `CheckCircle2`, `Circle`, `Clock` 
3. After a user is looked up and `lookedUpProfile` is available, call `useSharedFamilyJourneyData(userId)` when the role is "family"
4. Render a new "Family Journey Progress" card between `<JourneyVisualSummary>` and the "User Journey Timeline" heading
5. The card is an exact copy of the Journey tab content from `UserDetailModal` (lines 471-570): progress bar, step list with Complete/Available/Locked badges, next step recommendation

### Layout Order After Change

```text
[JourneyVisualSummary - horizontal milestone dots]
[Family Journey Progress - 12-step list with badges]  ← NEW
[User Journey Timeline - detailed event cards]         ← EXISTING
```

### Note on Hook Usage

`useSharedFamilyJourneyData` uses `useNavigate()` internally. Since UserJourneyPage is already inside a Router context, this works. The hook will be called with the looked-up userId and will fetch the same completion data the admin dashboard modal shows.

For non-family users, this section simply won't render (guarded by `lookedUpProfile?.role === 'family'`).

---

## Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/pages/admin/UserJourneyPage.tsx` | Add family journey progress panel below JourneyVisualSummary |

No new files needed - reuses existing hook and UI pattern.

