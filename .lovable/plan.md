

## Fix: Hide Real Names & Clean Up Professional Type Labels

### Two Problems

1. **Notification banner leaks full names**: `FamilyMatchNotification` fetches `full_name` from profiles and displays "Nevlyn George, Carlene Williams, Angela Newton Collymore and 3 more" — these should be anonymous until subscription.

2. **Raw `professional_type` shown as labels**: The `getDisplayProfessionalType` function in `useUnifiedMatches.ts` only maps 4 values (`gapp`, `nurse`, `cna`, `aide`). Missing mappings cause raw DB values to display: `other` → "other", `elderly` → "elderly", `hha` → "hha", `special_needs` → "special_needs", `null` → falls through.

### DB Values for Active Caregivers

| Caregiver | professional_type | Should Display As |
|-----------|------------------|-------------------|
| Daniella Walcott | gapp | GAPP Certified |
| Carlene Williams | cna | Certified Nursing Assistant |
| Altisha Hernandez | hha | Home Health Aide |
| Tricia Cumm | gapp | GAPP Certified |
| Carrema Canute | special_needs | Special Needs Caregiver |
| Candice Britto | gapp | GAPP Certified |
| Nevlyn George | other | Professional Caregiver |
| leslieann Jackman | elderly | Elderly Care Specialist |
| Anikie Peters | null | Professional Caregiver |

### Changes

#### 1. `src/hooks/useUnifiedMatches.ts` — Expand `getDisplayProfessionalType` (line 374-383)

Add missing mappings:
- `hha` → "Home Health Aide"
- `elderly` → "Elderly Care Specialist"
- `special_needs` → "Special Needs Caregiver"
- `other` → "Professional Caregiver"
- `companion` → "Companion Caregiver"
- `live_in` → "Live-in Caregiver"
- Default fallback: title-case the value instead of showing raw (e.g. `some_type` → "Some Type"), and if it's a single generic word like "other", return "Professional Caregiver"

#### 2. `src/components/family/DashboardCaregiverMatches.tsx` — Fix `professionalLabel` (line 37-42)

Same issue — `professionalLabel` returns raw `professional_type`. Apply the same mapping logic or import a shared helper.

#### 3. `src/components/family/FamilyMatchNotification.tsx` — Replace names with anonymous labels (lines 44-56, 140-143)

Instead of fetching `full_name` and displaying real names, fetch `professional_type` and show anonymized labels:
- Change profile query from `select('id, full_name')` to `select('id, professional_type')`
- Change `caregiver_name` to use the display label (e.g. "GAPP Certified", "Certified Nursing Assistant")
- Line 141 becomes: "GAPP Certified, Certified Nursing Assistant, Home Health Aide and 3 more — matched based on your care needs."

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/hooks/useUnifiedMatches.ts` | Add hha, elderly, special_needs, other mappings + smart fallback |
| Modify | `src/components/family/DashboardCaregiverMatches.tsx` | Use same mapping in professionalLabel |
| Modify | `src/components/family/FamilyMatchNotification.tsx` | Show professional type labels instead of real names |

