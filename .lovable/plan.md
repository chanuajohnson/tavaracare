

## Build Caregiver Recruitment Page + Fix Urgent Caregivers + Add Urgent Families Page

### Problem
1. `/urgent-caregivers` shows ALL spotlight caregivers regardless of `available_for_matching` status — should only show those marked available in admin
2. No "Urgent Families" page exists to show families needing immediate matches
3. `/join-as-caregiver` exists but needs alignment with the urgent pages' visual style
4. Main homepage only has "Caregivers Available Now" button — needs "Families Available Now" and "Join as Caregiver" buttons too

### Changes

#### 1. Fix spotlight service to filter by `available_for_matching`
**File:** `src/services/spotlightService.ts`
- In `getActiveSpotlightCaregivers()`, join with profiles and add filter: only return caregivers where `profiles.available_for_matching = true`
- This ensures `/urgent-caregivers` only shows caregivers the admin has marked as available

#### 2. Create Urgent Families page
**File:** `src/pages/UrgentFamiliesPage.tsx` (new)
- Similar layout/style to `UrgentCaregiversPage.tsx` for visual consistency
- Query `profiles` where `role = 'family'` AND `care_urgency = 'immediate'` (or `within_week`)
- Show family cards with: name, location, care types needed, urgency badge
- WhatsApp CTA routes to business number with family details
- "Families Available Now" branding with heart icon

#### 3. Enhance `/join-as-caregiver` page
**File:** `src/pages/JoinAsCaregiver.tsx`
- Align visual style with the urgent pages (gradient hero, motion animations, trust badges)
- Keep existing UTM tracking and sign-up flow
- Add San Fernando/Palmiste area mention in copy as a current high-demand area

#### 4. Update homepage with all three CTAs
**File:** `src/pages/Index.tsx`
- Add "Families Available Now" button below "Caregivers Available Now"
- Add "Join as Caregiver" recruitment button
- All three buttons in a vertical stack or row in the hero section

#### 5. Add routes and navigation
**File:** `src/components/routing/AppRoutes.tsx` — Add `/urgent-families` route
**File:** `src/components/routing/RouteValidator.tsx` — Add `/urgent-families` to valid patterns

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Modify | `src/services/spotlightService.ts` | Add `available_for_matching` filter to spotlight query |
| Create | `src/pages/UrgentFamiliesPage.tsx` | New page showing families needing urgent matches |
| Modify | `src/pages/JoinAsCaregiver.tsx` | Align visual style with urgent pages |
| Modify | `src/pages/Index.tsx` | Add "Families Available Now" and "Join as Caregiver" CTA buttons |
| Modify | `src/components/routing/AppRoutes.tsx` | Add `/urgent-families` route |
| Modify | `src/components/routing/RouteValidator.tsx` | Add `/urgent-families` to valid patterns |

