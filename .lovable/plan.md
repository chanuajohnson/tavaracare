## Two small responsive polish fixes (presentation only)

### 1. Mobile hero — content sits too high

`src/pages/Index.tsx` lines 420 + 465: the hero is `h-screen` with `flex flex-col items-center justify-center`. Because the sticky nav (~56px) sits above this `100vh` block, the geometric center of the section falls above the visible center of the viewport on phones, so the H1 "Find a Caregiver…" reads high and the CTAs drift down.

**Change:**
- Section: `h-screen` → `min-h-[calc(100vh-56px)] h-[calc(100vh-56px)] md:h-screen` so the centered column is centered in the *visible* area on mobile/tablet (nav offset accounted for), while desktop keeps the full-bleed `h-screen` look.
- Content wrapper (line 465): add `pt-8 md:pt-0` to give the headline a little breathing room from the top edge on small screens without nudging desktop.

No copy, color, font, animation, or video logic changes.

### 2. Tablet nav — Tavara logo + "It takes a village to care" squeezed

`src/components/layout/Navigation.tsx` lines 126–134: the brand block uses `flex-col sm:flex-row` and the tagline shows from `sm` upward with only `sm:ml-2`. On tablet widths (md, ~768–1023px) the full horizontal menu starts competing for space, crushing the logo + tagline together before the mobile menu kicks in at `lg`.

**Changes (lines 126–134 only):**
- Brand row: `flex items-center flex-col sm:flex-row` → `flex items-center flex-col sm:flex-row sm:gap-3 min-w-0 shrink-0`.
- Logo: `h-6 w-auto sm:h-7` → `h-6 w-auto sm:h-7 shrink-0`.
- Tagline: hide at the cramped tablet range and bring it back at `lg` where the row layout has room — `text-xs text-gray-600 italic sm:ml-2` → `hidden lg:inline text-xs text-gray-600 italic lg:ml-0 whitespace-nowrap`. Mobile already stacks the tagline below the logo via `flex-col`, so `hidden lg:inline` only affects the squeeze zone.

Net effect: phone keeps stacked logo + tagline; tablet shows just the clean logo (matches the existing tight-space pattern); desktop (`lg+`) shows logo + tagline inline with proper gap.

### Files

- `src/pages/Index.tsx` — two class-string tweaks on the hero section + content wrapper.
- `src/components/layout/Navigation.tsx` — three class-string tweaks on the brand block.

### Out of scope (protected)

No changes to routes, AuthProvider, registration, chat flow, nav links, hero video logic, role CTAs, copy, or design tokens.

### Verification

- 390×844 (mobile): H1 reads visually centered, "It takes a village to care" tagline still appears under the logo in the nav (stacked).
- 820×1180 (tablet): nav shows logo only (no squeeze), hero centers cleanly above the fold minus nav.
- ≥1024px: nav shows logo + tagline inline with gap; hero unchanged.

Note: visual class-only tweaks like these can also be made for free via Visual Edits (select element → adjust). I'll still ship them in code so they persist across both breakpoints.
