## Two small, scoped changes

### 1. Mobile sticky CTA → readiness quiz (correct journey order)

The family journey is: **Readiness Quiz → Family Registration → Care Needs Assessment → …**

Today, `BlogStickyMobileCTA.tsx` sends the family audience to `/family/care-assessment`, which jumps two steps ahead. The inline + end-of-article CTAs on the blog already direct readers into the readiness flow; the mobile sticky bar should match.

**Change (single line, `src/components/blog/BlogStickyMobileCTA.tsx` line 45):**

```text
baseHref = audience === "professional"
  ? "/registration/professional"
  : "/family/readiness-quiz"     // was: /family/care-assessment
```

Everything else stays: UTM/attribution wrapping via `buildCtaDestination`, `trackBlogCtaClick({ placement: "sticky-mobile" })`, dismissible bar, "Back to article" breadcrumb state for the family path.

No changes to inline/end CTAs (they already point to the readiness flow), no changes to attribution tracking, no changes to the professional path.

### 2. TAV: minimal bubble everywhere, opens only on deliberate click

Today only `/`, `/dashboard/*`, and `/blog/*` are in `SILENT_ROUTE_PREFIXES` inside `src/components/tav/TavaraAssistantPanel.tsx` (lines 71–75). On every other route TAV auto-greets, auto-opens after a delay, and re-opens on navigation touchpoints + when nudges arrive — that's the disruptive popup you're seeing.

The blog behavior you want everywhere is exactly the existing "silent route" path: bubble renders, indicator/nudge count still updates, panel only opens when the user clicks the bubble (or uses Footer's `openPanel`).

**Change (`src/components/tav/TavaraAssistantPanel.tsx`):**

Replace the prefix list with a single global flag so every non-demo route is silent:

```text
// Before
const SILENT_ROUTE_PREFIXES = ['/dashboard', '/blog'];
const isSilentRoute = !isDemoMode && (
  location.pathname === '/' ||
  SILENT_ROUTE_PREFIXES.some(p => location.pathname === p || location.pathname.startsWith(p + '/'))
);

// After
// TAV is silent site-wide: bubble stays clickable, panel only opens on
// deliberate user action. Demo routes remain exempt so guided demos keep
// their auto-open behavior.
const isSilentRoute = !isDemoMode;
```

Everything downstream already respects `isSilentRoute`:
- Session auto-greeting effect (line 148) → skipped
- Navigation touchpoint auto-greeting (line 210) → skipped
- Auto-close when arriving on a silent route (line 241) → still closes any lingering panel
- Nudge auto-open (line 249) → skipped (bubble badge still updates via `markNudgesAsRead` / nudge fetch)

Demo routes (`/demo/*`, `/tav-demo`) continue to auto-open because `isDemoMode` short-circuits the flag — important for the guided demo experiences.

### What stays untouched

- Chat flow engine, registration flows, `FamilyRegistration.tsx`, AuthProvider, AppRoutes, layout/navigation — all protected files unchanged.
- TAV state machine, nudge service, Supabase calls, role detection, demo mode logic.
- Blog inline + end CTAs, share-link UTM forwarding, analytics dashboard, leaderboard.
- Footer's "Open TAV" entry point still works (calls `openPanel()` directly).

### Files

- `src/components/blog/BlogStickyMobileCTA.tsx` — one-line `baseHref` change.
- `src/components/tav/TavaraAssistantPanel.tsx` — replace `SILENT_ROUTE_PREFIXES` with site-wide silent flag (≈4 lines).

### Verification after build

1. Mobile blog post (non-professional category) → tap "Start family readiness" → lands on `/family/readiness-quiz?utm_*` with "Back to article" breadcrumb.
2. Any non-demo route (home, registration, care plan, admin, etc.) → TAV bubble appears bottom-right but panel does NOT auto-open; clicking the bubble opens it as before.
3. `/demo/family-registration` (or `/tav-demo`) → auto-open still fires (demo mode exempt).
