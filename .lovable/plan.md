

## Plan — Make the quiz recognize "errand & supply restocking" as the real Stage 4 need

### What you taught us with this feedback

The current quiz treats Stage 4 as abstract ("optimize," "hand over the load," "premium coordination") — but your lived reality is concrete: **caregivers are sorted, what's eating you alive is bananas, bread, meds, household consumables, and emergent runs**. That's a service offer we already have built (`/errands` page with `CareSupplyPackages` for recurring delivery + bundles + cadence + WhatsApp scheduling) — the quiz just doesn't know to point you there.

This is two changes: **(1) sharpen the quiz's language** so people in your situation feel seen, and **(2) wire the Stage 4 result to the errands service** that already exists.

### Changes

**1. Rewrite Q5 + Q6 with concrete, lived-experience options (`src/data/familyReadinessQuiz.ts`)**

Replace abstract Stage 3/4 options with the specific load you described. Stage 1/2 stay gentle.

| Q | Card 1 (Stage 1) | Card 2 (Stage 2) | Card 3 (Stage 3) | Card 4 (Stage 4) |
|---|---|---|---|---|
| **Q5** *"What kind of support feels most helpful right now?"* | Just the basics to get started | Help staying organized and on track | Step-by-step guidance to improve things | **A real person to handle errands, supplies, and restocking** |
| **Q6** *"What matters most to you right now?"* | My loved one's comfort | Keeping things manageable for me | Getting things properly set up | **Less running around — knowing groceries, meds & supplies just show up** |

This is the exact language families in your stage will recognize. No clinical talk, no "optimize." Just: *the bananas show up, the meds get refilled, I don't have to drag myself out when I'm not feeling well.*

**2. Rewrite Stage 4 result copy + retarget CTAs to the errands service**

In `readinessStages[4]`:

- **Title:** *"You're past the basics — let's lift the daily load."*
- **Body:** *"Care is in place. What's draining you now isn't the caregiving — it's the running around. The bananas, the bread, the medication refills, the emergent pharmacy runs when no one feels well. Tavara can take this off your plate on a schedule you set, so the house stays stocked without you holding the whole list in your head."*
- **Next steps (replacing the abstract "Full Care Environment Reset" / "Premium coordination" / "Talk to a care manager"):**
  1. **"Set up recurring supply delivery"** → `/errands#supplies` (deep-link to `CareSupplyPackages` section)
  2. **"Book a one-off errand run"** → `/errands` (top of page — `ErrandsForm`)
  3. **"Talk to a care manager"** → existing care-management link, kept as outline tertiary

**3. Add an anchor to the errands page so the deep link lands on supply packages (`src/pages/errands/ErrandsPage.tsx`)**

Wrap `<CareSupplyPackages />` in `<section id="supplies" className="scroll-mt-24">` so `/errands#supplies` scrolls Stage 4 families straight to the recurring-delivery flow (bundles, cadence, WhatsApp schedule) without making them hunt past the hero and one-off form.

**4. Stage-4-aware family dashboard nudge (`src/components/family/FamilyDashboard.tsx`)**

When `client_stage === 4` AND the user has no recent errand activity, show a small soft card under the existing readiness banner area:

> 📦 **Tired of holding the list?** Set up recurring delivery for groceries, meds, and household consumables. We deliver on your schedule. → *Set it up*

Single card, dismissible, links to `/errands#supplies`. Suppressed for stages 1–3 (they don't need this yet — same anti-Ana principle).

### Files touched

| File | Change |
|---|---|
| `src/data/familyReadinessQuiz.ts` | Rewrite Q5 card-4 + Q6 card-4 copy; rewrite `readinessStages[4]` title/body/nextSteps to point at `/errands#supplies` and `/errands` |
| `src/pages/errands/ErrandsPage.tsx` | Wrap `<CareSupplyPackages />` in `<section id="supplies" className="scroll-mt-24">` |
| `src/components/family/FamilyDashboard.tsx` | Add soft Stage-4-only "recurring supply delivery" nudge card with dismiss state in `localStorage` |

**No** changes to: scoring logic, quiz UI components, AppRoutes, FamilyRegistration, AuthProvider, App.tsx, chat flow, errands form, payment buttons, or `CareSupplyPackages` itself.

### Acceptance test

1. Take the quiz answering mostly card-4 (especially the new Q5/Q6 options about errands and supplies) → land on **rewritten** Stage 4 result with the new title *"You're past the basics — let's lift the daily load"* and body referencing bananas/bread/meds
2. Click **"Set up recurring supply delivery"** → land on `/errands` scrolled directly to the `CareSupplyPackages` section (bundles visible immediately, no need to scroll past hero)
3. Click **"Book a one-off errand run"** → land at top of `/errands` (existing form)
4. Sign in as a family with `client_stage = 4` → dashboard shows the new soft "Tired of holding the list?" nudge card
5. Sign in as a family with `client_stage = 1, 2, or 3` → nudge card is **not** shown (Ana protection holds)
6. Dismiss the dashboard card → it stays dismissed across reloads (localStorage flag)

### Out of scope

- Adding a new question (keeping it 6) — the rewritten Q5/Q6 cards carry the new signal cleanly
- Changing scoring math — the average-rounded-to-stage logic still works
- New routes, schema changes, or RLS — none needed
- TAV tone variants per stage (already noted as separate workstream)
- Touching the chat flow, FamilyRegistration, AppRoutes structure, or AuthProvider

