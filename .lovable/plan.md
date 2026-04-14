

## Plan: Fix NI 184 Pre-fill Bug + System-Wide Language Positioning Shift

### Part 1: Fix NI 184 Blank PDF Bug

**Root Cause**: The NI 184 government PDF has `/Rotate=90` in its metadata. Its mediabox is portrait (612x1008), but it's displayed as landscape (1008x612). 

The current code does:
```
const { height: pageHeight } = page.getSize(); // Returns 1008 (mediabox, wrong!)
const pdfY = pageHeight - structY - size;       // 1008 - 228 - 7 = 773 (way off)
```

pdf-lib's `drawText` works in the visual coordinate system where the visual height is actually **612**. All text is being drawn ~400 points above where it should be — completely off the visible page. That's why the download produces a blank form.

**Fix in `src/services/care-plans/reports/ni184Generator.ts`**:
- After `page.getSize()`, check `page.getRotation().angle`
- Calculate visual height: if rotation is 90 or 270, visual height = mediabox width (612)
- Use visual height for the Y conversion instead of mediabox height
- Same fix needed in `ni187Generator.ts` (though NI 187 has no rotation, adding the check defensively)

**Also fix the `as any` type cast** on the Blob constructor (line 232).

---

### Part 2: Language Positioning Shift (Coordination Platform, Not Employer)

Update language across **7 files** to shift from employer/agency model to care coordination/management platform:

#### File 1: `src/components/admin/onboarding/onboardingSections.ts` (Family Terms & Post-Onboarding)
- **Line 231**: "not hiring the caregiver directly" → "The family engages caregivers directly, with Tavara providing coordination, structure, and support"
- **Line 232**: "assigned caregiver is part of Tavara's rotation pool" → "care team member is part of a coordinated rotation pool managed by Tavara for seamless coverage"
- **Line 235**: "Tavara handles all employer aspects of NIS" → "The family is responsible for statutory obligations including NIS contributions. Tavara provides guidance and tools to help manage these requirements"
- **Lines 253-258**: Replace "Assigned nurse" language with "Care team member" and "coordinated by Tavara" language
- **Line 258**: "Tavara handles all employer NIS obligations" → "NIS contributions are the family's responsibility — Tavara provides tools and guidance to manage them"

#### File 2: `src/components/admin/onboarding/professionalOnboardingSections.ts` (Professional Terms & Post-Onboarding)
- **Line 144**: "hired through Tavara Care" → "engaged by the family, with Tavara Care providing coordination, structure, and support"
- **Line 149**: "NIS contributions are handled by Tavara as the employer of record" → "NIS contributions are managed through Tavara's coordination platform"
- **Line 161**: "Assigned nurse confirmed" → "Care team member confirmed"
- **Line 164-165**: Remove "employer of record" language, replace with coordination language
- **Line 166**: "View your assignments" → "View your coordinated care placements"

#### File 3: `src/hooks/useEnhancedJourneyProgress.ts` (Journey Steps)
- **Step 9 (line 50)**: "Caregiver Assigned" → "Care Team Confirmed"
- **Step 9 description**: "matched and assigned to your family" → "selected and coordinated for your care team"
- **Step 9 tooltip**: "View your assigned caregiver" → "View your care team member"
- **Step 10 (line 51)**: "assigned caregiver" → "care team member"
- **Step 11**: "Your caregiver starts providing care" → "Your care team begins"
- Same changes in the second step definition block (~lines 714-740)

#### File 4: `src/components/family/CaregiverReadinessCard.tsx`
- **Line 109**: "Your assigned caregiver has completed" → "Your care team member has completed"

#### File 5: `src/pages/admin/AdminOnboardingChecklistPage.tsx` (Admin checklist labels)
- **Line 270**: "not direct hire" → "family engages caregiver directly with Tavara coordination"
- **Line 271**: "Assigned caregiver" → "Care team member"
- **Line 274**: "NIS contributions for caregiver covered by Tavara" → "NIS guidance and tools provided by Tavara"
- **Lines 279-284**: Replace all "Assigned nurse" with "Care team member", remove "paid by Tavara" (replace with "coordinated by Tavara")

#### File 6: `src/components/care-plan/DailyCareLogsTab.tsx`
- **Line 277**: "your assigned nurse" → "your care team member"

#### File 7: `src/components/care-plan/ScheduleTab.tsx`
- **Line 329**: "Assigned nurse called in sick" → "Care team member called in sick"

#### File 8: `src/components/about/MissionCard.tsx`
- **Line 31**: Update mission text to emphasize coordination: "We coordinate and manage care teams for families while providing..."

---

### Summary of Impact

| Area | Old Language | New Language |
|------|-------------|-------------|
| Onboarding checklists | "Tavara handles NIS", "employer of record" | "Family responsible for NIS, Tavara provides guidance/tools" |
| Journey steps | "Caregiver Assigned" | "Care Team Confirmed" |
| Dashboard cards | "Your assigned caregiver" | "Your care team member" |
| Professional terms | "Hired through Tavara" | "Engaged by the family, Tavara coordinates" |
| Post-onboarding | "Assigned nurse paid by Tavara" | "Care team member coordinated by Tavara" |

### Implementation Order
1. Fix NI 184/187 PDF rotation bug (highest priority — broken feature)
2. Update onboarding section definitions (family + professional)
3. Update journey progress steps
4. Update remaining UI components (readiness card, daily logs, schedule, admin checklist, about page)

