

## Show First Names on Caregiver Match Cards (Like Urgent Caregivers Page)

### Problem
Match cards currently show professional type as the title (e.g., "Certified Nursing Assistant", "Gapp Certified") with initials derived from that type (CNA, GC) and "Name protected until subscription" text. The Urgent Caregivers page shows real first names and proper initials (CW, TC) which is more personable.

### Solution
Fetch `first_name` alongside existing profile data and display it on match cards. Show the professional type as a subtitle/badge instead of the main heading. Use the caregiver's real name for initials.

### Changes

#### 1. `src/hooks/useUnifiedMatches.ts`
- Add `first_name` to the `UnifiedMatch` interface
- Add `first_name` to the profile SELECT query
- Pass `first_name` through in the match object

#### 2. `src/components/family/SimpleMatchCard.tsx`
- Extract first name from `caregiver.first_name` or first word of `full_name`
- Display first name as the card heading (e.g., "Carlene")
- Show professional type as a subtitle line below the name (e.g., "Certified Nursing Assistant")
- Remove "Name protected until subscription" text
- Keep initials derived from `full_name` (real initials like CW, TC)

#### 3. `src/components/family/CaregiverMatchCard.tsx`
- Same pattern: show first name + professional type subtitle
- Remove "Name protected until subscription" text
- Use real initials from `full_name`

#### 4. `src/components/family/MatchDetailModal.tsx`
- Change "Professional Caregiver" heading to show first name
- Add professional type as subtitle

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/hooks/useUnifiedMatches.ts` | Add `first_name` to query and interface |
| Modify | `src/components/family/SimpleMatchCard.tsx` | Show first name as title, professional type as subtitle, real initials |
| Modify | `src/components/family/CaregiverMatchCard.tsx` | Same first-name treatment |
| Modify | `src/components/family/MatchDetailModal.tsx` | Show first name instead of "Professional Caregiver" |

