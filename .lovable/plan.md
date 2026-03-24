

## Redesign Family Cards to Match Caregiver Card Standard

### What Changes

**File: `src/pages/UrgentFamiliesPage.tsx`** -- full card redesign

1. **Privacy**: Remove `care_recipient_name` from interface and query. Remove `getFirstNameLastInitial`. Add `getInitials` helper (e.g., "Carol Glenn" -> "CG").

2. **New imports**: `Avatar`, `AvatarFallback` from ui/avatar, `UrgentBadge` from spotlight, `Award`, `MessageCircle`, `Briefcase` from lucide-react.

3. **Schedule labels map**:
   - `mornings` -> "Morning Care", `afternoons` -> "Afternoon Care", `evenings` -> "Evening Care", `overnight` -> "Overnight Care", `full_time` -> "Full-time Care", `flexible` -> "Flexible Schedule"

4. **Card structure** (mirroring `SpotlightCaregiverCard`):
   - Gradient header (`bg-gradient-to-br from-primary/10 to-primary/5`) with `UrgentBadge` (urgency mapped: `immediate` -> high, else medium)
   - Avatar with initials overlapping header (-mt-8), primary bg, white text
   - Title: "Family in [General Area]" + subtitle "Seeking compassionate care"
   - Location with MapPin, schedule with Clock icon
   - Care type badges (max 4 + overflow)
   - Pulsing "Seeking care now" status dot + "Verified Family" with Award icon
   - Dual buttons: "View Details" (outline) + "WhatsApp" (green)

5. **Query**: Remove `care_recipient_name` from select statement

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Modify | `src/pages/UrgentFamiliesPage.tsx` | Redesign cards to match caregiver standard -- initials avatar, gradient header, status badges, dual CTAs, no names |

