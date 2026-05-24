## Plan: rotating blog strip on /locations pages

Add a "Recommended reading" strip near the top of every location page (Port of Spain, San Fernando, Arima, Tobago, Diamond Vale) showing 3-4 clickable blog post cards that rotate each visit. Cards link to `/blog/:slug`, where the existing breadcrumb (Home / Blog / Category) handles navigation back.

### What changes

1. **`src/components/landing/LandingPageScaffold.tsx`**
   - New `RecommendedReadingStrip` block rendered right under the hero, above the care rates strip.
   - Uses `usePublishedPosts()` from `src/lib/blog/api.ts` to pull all published posts (already cached via React Query, so no extra cost across pages).
   - Picks 4 posts using a deterministic shuffle seeded by `data.slug` + the current hour bucket, so:
     - Each location shows a different mix
     - The mix rotates a few times per day
     - SSR/prerender output is stable within the hour
   - Each card: small cover thumbnail (or category badge fallback), category kicker, title, "Read" chevron. Whole card is a `<Link to={\`/blog/\${post.slug}\`}>`.
   - Responsive: 1 col mobile, 2 col tablet, 4 col desktop. Horizontal scroll on very narrow screens is not needed at 4 cards.
   - Gracefully hides if fewer than 2 published posts exist or query is loading/errored (no skeleton noise on landing pages).

2. **No changes** to `locationsData.ts`, individual location pages, routes, or blog post pages. Breadcrumbs on blog posts already exist and handle the return path.

### Copy

- Section heading: "From the Tavara blog"
- Subhead: "Short reads families and caregivers in [areaServed] find useful." (falls back to "Trinidad & Tobago" when `areaServed` is absent.)
- Respects the Tavara language guardrails (no banned terms).

### Technical details

```text
RecommendedReadingStrip({ areaServed, seedSlug })
  const { data: posts } = usePublishedPosts()
  if (!posts || posts.length < 2) return null
  const seed = hash(seedSlug + Math.floor(Date.now() / 3_600_000))
  const picks = seededShuffle(posts, seed).slice(0, 4)
  render grid of <Link to={`/blog/${post.slug}`}> cards
```

- Seeded shuffle: small inline Fisher-Yates using a tiny LCG so output is deterministic per seed.
- No new dependencies, no new routes, no DB or edge-function changes.