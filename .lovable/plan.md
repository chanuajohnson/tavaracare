

## Fix Mobile Layout: Overlapping Text in Journey Cards

### Problems (from screenshots)

1. **Stage card headers**: The percentage text ("100%"), stage name ("Foundation"), step count ("6 of 6 steps"), and progress circle all overlap on mobile — they're in a horizontal flex layout with no mobile stacking.

2. **Main journey header**: Same issue — "100%" overlaps with "Your Care Journey Progress" text and the circular progress indicator.

3. **Step description outdated**: "Schedule Your Tavara.Care Visit" step still shows "Choose to meet your match and a care coordinator virtually (Free) or in person ($300 TTD)." — this should have been updated to reflect Trial Day / Hire Immediately.

4. **Step cards too wide on mobile**: Button text + status text + icons crowd the right side, causing overflow.

### Changes

#### 1. `src/components/family/JourneyStageCard.tsx` — Mobile-optimized stage header (lines 224-310)

**Stage header** (lines 224-310): On mobile, stack the layout vertically:
- Row 1: Icon + stage name + badge (left), chevron (right)
- Row 2: Progress circle + percentage + step count — in a horizontal row below the name
- Row 3: Description text

Currently everything is `flex items-start justify-between gap-4` which causes overlap. Change to:
- Mobile: `flex flex-col gap-3`
- Desktop: keep current horizontal layout

Specifically:
- Lines 266-309 (the right-side percentage + circle + chevron): On mobile, move below the title in a compact horizontal row. Hide the large standalone percentage text on mobile (it's duplicated inside the circle anyway). Make progress circle smaller on mobile (w-12 h-12 instead of w-16 h-16).

**Step cards** (lines 360-474): On mobile, stack the button below the description instead of beside it:
- Lines 440-468: Wrap in `flex-col sm:flex-row` so the button drops below on mobile
- Make button full-width on mobile

#### 2. `src/components/family/EnhancedFamilyNextStepsPanel.tsx` — Mobile-optimized main header (lines 250-340)

Same pattern — the main header has percentage + circle overlapping title on mobile:
- Lines 302-338 (right-side progress): On mobile, place below the title/description instead of beside it
- Hide the large "100%" text on mobile (circle already shows it)
- Make circle smaller on mobile (w-14 h-14 instead of w-20 h-20)

#### 3. `src/hooks/useEnhancedJourneyProgress.ts` — Verify step 7 description

Check that the step description for "Schedule Your Tavara.Care Visit" was properly updated to mention Trial Day / Hire Immediately instead of "virtually (Free) or in person ($300 TTD)".

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/family/JourneyStageCard.tsx` | Stack header layout vertically on mobile, compact progress circle, stack step buttons below on mobile |
| Modify | `src/components/family/EnhancedFamilyNextStepsPanel.tsx` | Stack main header progress below title on mobile, smaller circle |
| Verify | `src/hooks/useEnhancedJourneyProgress.ts` | Ensure step 7 description reflects new care options |

