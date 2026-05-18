## Goal

One source of truth for "How matching works on Tavara", presented the same way on `/about` and all four `/care/*` location pages.

## Current state

- **`/about`** uses `src/components/about/HowMatchingWorksCard.tsx` — 5 steps for families, 5 for caregivers, tabs, icons, accordions, quotes. Self-contained data + UI.
- **`/care/port-of-spain`, `/care/san-fernando`, `/care/arima`, `/care/tobago`** all render `src/components/landing/LandingPageScaffold.tsx`, which hardcodes a **different**, simpler 4-step list (lines 154–174).
- Inconsistent step count (4 vs 5), inconsistent labels, inconsistent voice.

## Approach

### 1. Extract the matching steps to a shared data module

New file: `src/data/howMatchingWorks.ts`

Move `familySteps` and `caregiverSteps` (plus the `Step` interface) out of `HowMatchingWorksCard.tsx` into this module. No content changes — same 5 family + 5 caregiver steps already on `/about`. This becomes the single source of truth.

### 2. Refactor the existing About card to consume the shared data

Edit: `src/components/about/HowMatchingWorksCard.tsx`

- Remove the local `familySteps` / `caregiverSteps` arrays.
- Import them from `@/data/howMatchingWorks`.
- Everything else (tabs, icons, accordions, copy) stays identical. `/about` looks unchanged.

### 3. Replace the hardcoded 4-step list on /care pages with the same component

Edit: `src/components/landing/LandingPageScaffold.tsx`

- Delete the hardcoded `<ol>` block at lines 154–174.
- Render `<HowMatchingWorksCard />` (the same one /about uses) inside the existing `bg-muted/30 border-y` section so the visual rhythm of the location pages is preserved.
- Result: all four `/care/*` pages now show the exact same 5-step "Understand Your Reality → Match for Fit → Meet Your Care Team → Prepare the Home for Care → Coordinate and Sustain" experience as `/about`, with the For Families / For Caregivers tabs.

### 4. Leave per-location FAQs and copy untouched

The location-specific intro, sections, FAQs, and CTA in `locationsData.ts` stay as they are. Only the "How matching works" block gets unified.

## Pricing disclosure line — decision needed

The line on `LandingPageScaffold.tsx` (line 139):

> "Care rates are paid directly to the caregiver. Subscription tier details are shared privately during onboarding."

is compliant with the financial-privacy guardrail (rates pass-through, subscription detail deferred to private onboarding). Options:

- **A. Keep as-is** — it's correct, transparent, and Caribbean-direct.
- **B. Soften** to: "Care rates are paid directly to the caregiver. We share subscription details with you during onboarding."
- **C. Remove** the second sentence entirely so public pages never mention subscriptions.

I'd lean **A**. Tell me if you want B or C and I'll fold it into the same change.

## Out of scope

- No changes to the per-location intro/sections/FAQs.
- No changes to the `HowMatchingWorksCard` visual design.
- No routing changes. No new pages.
- No edits to chat-flow, registration, or any protected file.

## Verification

After implementing:
1. Visit `/about` → matching card looks identical to today.
2. Visit `/care/port-of-spain`, `/care/san-fernando`, `/care/arima`, `/care/tobago` → each shows the same 5-step matching card with the For Families / For Caregivers tabs, replacing the old 4-step list.
3. Per-location FAQs and intro copy unchanged.
4. Typecheck clean.

## Question for you

1. Should I proceed with the unification as described (option A on the pricing line)?
2. Or do you also want me to soften (B) or remove (C) the subscription sentence?
