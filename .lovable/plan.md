## Above-the-fold copy stack on `/blog/senior-care-costs-trinidad-tobago-2026`

Add three tight blocks between the H1 and CostHeroCTA on this slug only. Other blog posts unchanged. No body rewrites. No new files. All presentation.

### What renders, in order, after the change

```
[ category badge · date ]
[ H1: Senior Care Costs in Trinidad & Tobago (2026 Guide) ]
[ Subhead (NEW, slug-specific) ]
[ Trust strip (NEW, slug-specific) ]
[ Avatar + byline ]
[ Quick-jump pill nav (NEW, slug-specific) ]
[ CostHeroCTA (existing) ]
[ BlogTopCTA (existing) ]
[ Audio player + body... ]
```

### The copy (final, no em/en-dashes, language-guardrail clean)

**1. Subhead (replaces `post.description` for this slug only at render time)**
> In-home care in T&T runs $40 to $50+ per hour. Live-in starts from $2,400 per week. Here is the full 2026 breakdown, with what each tier includes and the quiet costs nobody mentions.

**2. Trust strip (3 inline items, separated by middle dots)**
> Vetted caregivers · Most families matched in days · Transparent care rates

**3. Quick-jump pills (4 anchor links, horizontal, wrap on mobile)**
> Hourly rates · Live-in care · What drives cost up · Hidden costs

Pills are real anchor links that scroll to the corresponding `##` headings already present in the post body. The mapping uses the existing slug-from-heading rule (`react-markdown` + `remark-gfm` already generates these IDs).

### Where the code change lands

**File:** `src/pages/blog/BlogPostPage.tsx`, single render block between lines 359 and 377. Three new conditional renders gated on `post.slug === "senior-care-costs-trinidad-tobago-2026"`.

- **Subhead override.** Instead of editing `post.description`, render a slug-specific `<p>` and skip the generic description for this one slug. The SEO meta description (which is read from `post.description` elsewhere) stays untouched so the SERP snippet does not change.
- **Trust strip.** A `<ul>` with 3 `<li>` items, each prefixed with a `Check` icon (lucide-react, already imported across the codebase). Muted text, small, single line on desktop, wraps cleanly on 390px.
- **Quick-jump pills.** Plain `<a href="#hourly-rates">` style anchors styled as small rounded pills (`bg-primary/10 text-primary border border-primary/20`). On click, fire one `cta_engagement_tracking` insert with `action_type: "blog_jumplink_click"` and `additional_data: { post_slug, anchor }` so the funnel card can see whether jump-link readers convert better than scroll-readers.

### Tracking detail

One new event type, `blog_jumplink_click`, fired only from this slug. Not added to the `TRACKED` array in `useBlogAnalyticsRange.ts` for now since the funnel card does not need it as a step; it lives in `cta_engagement_tracking` raw so we can query it directly if jump links underperform and we want to kill them.

### Files touched

| File | Change | Lines |
| --- | --- | --- |
| `src/pages/blog/BlogPostPage.tsx` | Insert 3-block slug-specific stack between H1 and CostHeroCTA, suppress default `post.description` `<p>` on this slug | ~30 added, 1 line guarded |

One file. No new components, no new exports.

### What this plan deliberately does NOT do

- No edits to `post.description` in `posts.ts` — keeps SERP snippet stable
- No changes to other blog posts
- No changes to body copy, table, audio player, or comments
- No new files, components, or hooks
- No subscription-pricing edits (still flagged separately)
- No `FamilyRegistration.tsx`, routing, or auth changes

### Trade-off you should know about

Stacking subhead + trust strip + pills pushes the audio player and the BlogTopCTA further down. On 390×567 the BlogTopCTA almost certainly drops below the fold after this change. The bet is that the CostHeroCTA (the primary action) plus the rate anchor in the subhead carry conversion above the fold, and BlogTopCTA becomes the second-scroll catch. If the funnel card shows `top-family` clicks drop sharply after shipping, we tighten the spacing or drop the trust strip.
