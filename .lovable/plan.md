## Goal
Tidy the `/admin/lifecycle-cost` page by wrapping each major section in a single shared accordion so prospects see clean headings and expand only what they need. Default-open the first section; everything else collapsed.

## File to edit
- `src/pages/admin/LifecycleCostPage.tsx` (only this file — uses existing `@/components/ui/accordion` shadcn primitive, no new components, no logic changes)

## Accordion structure (top → bottom)

Use a single `<Accordion type="multiple" defaultValue={["before-day-0"]}>` so users can open multiple panels at once, but only the first is open on load.

| Order | Value | Trigger heading | Body (existing content, unchanged) |
|------|------|----------------|------------------------------------|
| 1 | `before-day-0` | **Before Day 0** — *What families get for free — no payment required* | `<FreePlanValueCard />` (the intro copy already lives inside it; we'll just hide the card's own header chrome by leaving it as-is — header becomes a bit redundant with the trigger, so we'll drop the inner CardHeader title row and keep only the descriptive paragraph + features grid + bridge box) |
| 2 | `day-0` | **Day 0** — *Mandatory setup bundle — paid before any care begins* | The existing Day 0 Card body (4-item grid + billing-rhythm info box) |
| 3 | `scenarios` | **Three side-by-side scenarios** — *Conservative · Typical · Premium* | `<ScenarioComparisonGrid timelines={timelines} ... />` |
| 4 | `optional` | **Optional** — *Services added when needed — not blindsided* | `<OptionalServicesRow pricing={pricing} />` |
| 5 | `builder` | **Build your own scenario** — *Customize hours, rate, subscription, add-ons* | The existing 2-column builder + custom timeline grid |

The page header (title, Print/PDF buttons) and the bottom disclaimer stay **outside** the accordion as always-visible context.

## Trigger styling
- Use a 2-line trigger: bold heading on top, muted subtitle below.
- Include the same coloured `Badge` (Before Day 0 / Day 0 / Optional) inline with the heading so the visual cues from the current cards are preserved.
- Wrap each `AccordionItem` in a subtle border + rounded container (`border rounded-lg px-4`) so it reads as a card stack rather than a flat list.

## Small content tweak inside FreePlanValueCard
Because the accordion trigger now shows the "Before Day 0 / What families get for free" heading, the duplicate `CardHeader` title inside `FreePlanValueCard` becomes redundant. Two options:
- **Option A (recommended):** keep `FreePlanValueCard` untouched — the duplication is mild and protects the card's standalone reusability.
- Option B: add a `hideHeader?: boolean` prop and hide just the `CardTitle` line when used inside the accordion. (Only do this if you ask for it.)

Going with **Option A** unless you say otherwise — zero risk to the component, and the trigger + inner title together actually reinforce the message.

## What does NOT change
- No logic changes (pricing, timelines, builder state all stay).
- No changes to `FreePlanValueCard`, `ScenarioComparisonGrid`, `OptionalServicesRow`, `LifecycleCostBuilder`, or any utility.
- No database changes.
- No artifact regeneration (PDF/PPTX) unless you reply "regen artifacts".
- Print behaviour: the browser's print stylesheet will collapse accordions to whatever's open. To keep PDF print fidelity, we can optionally force all panels open when printing via a tiny CSS rule (`@media print { [data-state="closed"] > [role="region"] { display: block !important; } }`) — included in the plan as a one-liner inside the page.

## Mobile / responsive
Accordion is natively mobile-friendly. Triggers will stack heading + subtitle on narrow screens; badges remain inline. No breakpoint changes needed.

## Acceptance check (after implementation)
1. Visit `/admin/lifecycle-cost` — only "Before Day 0" panel is expanded.
2. Click each of the other 4 triggers — each panel expands independently and shows the existing content unchanged.
3. Print preview shows all panels expanded (thanks to the print CSS override).
4. No console errors; no pricing/data drift.
