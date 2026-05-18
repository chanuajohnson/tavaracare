# Helpful, on-brand 404 page

## Why this matters
The screenshot shows `/service/elder-care` (singular) hitting a cold, generic 404. Tavara visitors here are typically:
- A family in a stressful moment looking for care
- A caregiver looking for work or onboarding
- Someone who followed a stale link, mistyped, or clicked a blog reference to a removed slug

A bare "404 Oops!" wastes that intent. We can route them somewhere useful in one tap and reinforce trust at the same time.

## Scope
Only `src/pages/NotFound.tsx`. No router changes, no new routes, no copy elsewhere. Layout (Navigation/Footer) already wraps this route, so we just redesign the page body.

## What the new 404 will do

1. **Warm, human headline** instead of "Oops!" — language guardrails compliant (no "agency", no "hire", no em-dashes). Acknowledge they may be looking for care or looking to provide care.

2. **Smart path suggestion** — small, dependency-free helper inside the file:
   - Common typo map: `/service/*` → `/services/*`, `/location/*` → `/locations/*`, `/blogs/*` → `/blog/*`, trailing-slash, etc.
   - If the bad path matches a known good route via a small allow-list (the 4 location pages, 4 service pages, /blog, /about, /auth, /faq), surface a "Did you mean: …" card with a primary CTA to that route.
   - If no confident match, skip the suggestion block (don't show noise).

3. **Two role-based recovery cards** — the core of the page:
   - **"I need care for a loved one"** → primary CTA to `/auth?mode=signup&role=family`, secondary text link to `/services/elder-care`.
   - **"I'm a caregiver"** → primary CTA to `/auth?mode=signup&role=professional`, secondary text link to `/about`.

4. **Quick links row** — 4–6 small chips to the highest-value destinations: Home, Services, Locations, Blog, FAQ, Contact via WhatsApp (uses `openCaregiverWhatsApp`-style direct link to 18687865357 with a generic "I landed on a missing page, can you help?" message).

5. **Reassurance footer line** — one sentence reinforcing Tavara is a care coordination platform in T&T, with a subtle link to support.

6. **Preserve existing behavior**:
   - Keep the `console.error` log of the missing path (useful for diagnostics).
   - Keep the breadcrumb at top.
   - Keep the page rendered inside the existing `Layout` (so Navigation + Footer + TAV panel still show — they already do via the route wrapper).

## Visual direction
- Use design-system tokens only (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-card`, `border-border`). No raw `bg-gray-100` / `text-gray-500` like today.
- Centered, generous whitespace, max-w-3xl content column.
- Two recovery cards side-by-side on md+, stacked on mobile. Each card: icon (lucide: `Heart` for family, `HandHeart`/`Stethoscope` for caregiver), short heading, one-line description, primary button, subtle secondary link.
- Subtle 404 watermark above the heading (small muted "Error 404 · Page not found") rather than a giant "404".
- Mobile-first responsive (per project rules).

## Copy (final)
Following Tavara language guardrails (no banned words, no em-dashes, no "Oops!").

- **Watermark:** `Page not found`
- **Headline:** `We couldn't find that page, but we can still help.`
- **Subhead:** `Whether you're arranging care for a loved one or you're a caregiver looking for your next family, you're in the right place.`
- **Family card title:** `Arranging care for a loved one`
- **Family card body:** `Tell us about your situation and we'll match you with a care team in Trinidad & Tobago.`
- **Family CTA:** `Find care`
- **Caregiver card title:** `I'm a caregiver`
- **Caregiver card body:** `Join Tavara to be matched with families who need your skills and to manage your shifts in one place.`
- **Caregiver CTA:** `Join as a caregiver`
- **Suggestion card (only when matched):** `Did you mean {suggestedPath}?` with a `Go there` button.
- **Quick links:** Home · About · Services · Locations · Blog · Message us on WhatsApp
- **Footer line:** `Still stuck? Message the Tavara team on WhatsApp and we'll point you the right way.`

## Technical details
- Pure presentational change in one file: `src/pages/NotFound.tsx`.
- Add a local `suggestRoute(pathname: string): string | null` helper at module scope (small map + a couple of regex normalizations).
- Use `Link` from `react-router-dom` for internal navigation, `<a target="_blank" rel="noopener">` for the WhatsApp `https://api.whatsapp.com/send/?phone=18687865357&text=...` link.
- All colors via semantic Tailwind tokens already defined in `index.css` / `tailwind.config.ts`.
- No new dependencies. No edits to App.tsx, Layout, or any route config (guardrail-compliant).

## Out of scope
- No changes to `public/404.html` (that's the hosting-level redirect shim, separate concern).
- No new analytics events.
- No changes to router, navigation, or any other page.
- No design directions tool — this is a small, well-scoped rebuild of one presentational page with clear copy direction already approved-style; I'll implement directly on approval.

## Verification after build
1. Visit `/service/elder-care` (the URL in the screenshot) → should show 404 with "Did you mean /services/elder-care?" suggestion.
2. Visit `/totally-bogus-xyz` → should show 404 without suggestion block, both recovery cards visible.
3. Mobile viewport (375px) → cards stack, CTAs full-width, no horizontal scroll.
4. Console should still log `404 Error: User attempted to access non-existent route: …`.
