

## Two Fixes: Professional Dashboard Awareness Banners + Family Story Button Reliability

### Problem 1: Family Quick Access — "Share Loved One's Story" still missing

The `showStoryButton` logic relies on `steps.find(step => step.step_number === 3)?.completed` which goes through a complex merge pipeline. Despite the merge code looking correct, the button doesn't appear — likely a subtle race condition or data timing issue in the merge.

**Fix**: Use a direct, independent check. Destructure `careRecipient` from `useEnhancedJourneyProgress()` and force the story button to show when `careRecipient` is null/missing, bypassing the steps array entirely.

#### Modify: `src/components/family/FamilyShortcutMenuBar.tsx`

- Destructure `careRecipient` alongside `steps, visitDetails, loading`
- Change `showStoryButton` logic to: `const showStoryButton = !careRecipient?.id || !careRecipient?.full_name;`
- This is a direct DB-driven check that can't be overridden by stored progress

---

### Problem 2: Professional Dashboard — No family awareness or readiness nudges

Caregivers have no visibility into the matching ecosystem. They need two notification banners above the existing content:

1. **Family Activity Banner** (blue): Shows count of unmatched families in the system. "There are X families looking for caregivers — keep your profile updated to get matched!" with a CTA to browse families anonymously.

2. **Matching Readiness Banner** (amber): "Matching is actively happening — make sure your profile, availability, and documents are current." with CTA to Profile Hub.

#### Create: `src/components/professional/ProfessionalFamilyAwarenessBanner.tsx`

- Queries `profiles` for family count where no active `caregiver_assignments` exist (unmatched families)
- Real-time subscription on `caregiver_assignments` to update count
- Blue gradient card with Users icon
- Shows: "**X families** are actively looking for caregivers in the Tavara network"
- CTA: "Browse Families →" links to `/caregiver/matching` (existing teaser page with anonymous details)
- Secondary text: "Keep your profile updated to improve your match chances"

#### Create: `src/components/professional/ProfessionalMatchingReadinessBanner.tsx`

- Amber gradient card with AlertCircle/RefreshCw icon
- Shows: "**Matching is active** — Tavara is connecting families with caregivers"
- Bullet points: "Update your availability", "Complete all certifications", "Upload required documents"
- CTA: "Update Profile →" links to `/professional/profile`
- Only shows when the caregiver's profile is incomplete OR as a persistent gentle reminder

#### Modify: `src/pages/dashboard/ProfessionalDashboard.tsx`

- Import both new banner components
- Insert them above `ManualMatchNotification` in the left column (lg:col-span-2), so they appear above "Messages & Requests" area

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/family/FamilyShortcutMenuBar.tsx` | Use `careRecipient` directly for story button visibility |
| Create | `src/components/professional/ProfessionalFamilyAwarenessBanner.tsx` | Blue banner showing unmatched family count with browse CTA |
| Create | `src/components/professional/ProfessionalMatchingReadinessBanner.tsx` | Amber banner nudging profile/doc updates during active matching |
| Modify | `src/pages/dashboard/ProfessionalDashboard.tsx` | Add both banners above ManualMatchNotification |

