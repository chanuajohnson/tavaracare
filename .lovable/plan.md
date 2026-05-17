## Blog launch plan — Tavara Care

Stand up `/blog` infrastructure + publish the first 4 cornerstone articles. Mix of high-intent SEO + emotional authority (your differentiator), per your strategy notes.

### The 4 articles (proposed mix — adjust before I implement)

**SEO / acquisition (2):**
1. **How to Find a Trusted Caregiver in Trinidad & Tobago** — category: Family Care Guides. CTA: Find Care → `/urgent-families` + `/family/matching`.
2. **Senior Care Costs in Trinidad & Tobago (2026 Guide)** — category: Family Care Guides. CTA: Book Consultation → `/family` + pricing transparency from `pricing_catalog`.

**Emotional authority (2):**
3. **When Help Feels Like Pressure: The Emotional Reality of Bringing Care Into the Home** — category: Emotional Realities of Care. CTA: Talk to Tavara.
4. **Why Families Resist Care at First — And Why That's Normal** — category: Emotional Realities of Care. CTA: Talk to Tavara.

Articles #3 (Dementia at Home) and #6 (Hoarding/Overwhelm) become the **next batch** — both deserve their own focused writing pass, and Hoarding especially needs careful tone work. Better to ship 4 strong than 6 rushed.

If you'd rather swap one (e.g. include Dementia at Home in the first 4 and defer "Why Families Resist Care"), tell me before I implement.

### Architecture

- **Source**: MDX files in `src/content/blog/` (per your earlier preference — no Supabase CMS for v1)
- **Routes** (additive only, respects routing guardrail):
  - `/blog` — index page with category filters (Family Care Guides / Emotional Realities / Caregiver & Community Support)
  - `/blog/:slug` — article page
  - Added to `AppRoutes.tsx` only (no `App.tsx` touch, no existing routes modified)
- **MDX loading**: `@mdx-js/rollup` + Vite plugin, frontmatter via `gray-matter`. Eagerly imported via `import.meta.glob` so build stays static.
- **Per-post head**: existing `<SEO>` component — unique title, description, canonical, OG, `Article` + `BreadcrumbList` JSON-LD schemas.
- **Sitemap**: append 5 entries (`/blog` + 4 posts) to `public/sitemap.xml` (current sitemap is hand-edited static; not migrating to a generator without your sign-off per the sitemap rules).
- **Styling**: Tailwind typography (`@tailwindcss/typography` if not present) + existing design tokens. No hardcoded colors.

### Article structure (each post)

- Frontmatter: `title`, `slug`, `description`, `category`, `publishedAt`, `author`, `readingTime`, `cta` (label + href), `heroImage` (optional)
- Body: 1,500–2,200 words, warm/observational tone per your guidance, T&T-specific framing, internal links to `/family`, `/urgent-families`, `/join-as-caregiver`, `/errands`, `/support/faq`, and across blog posts
- FAQ block at bottom (3–5 Q&As) → contributes to `FAQPage` schema
- Author: "The Tavara Care Team" (placeholder — change later if you want bylines)

### Files I will create / touch

**New:**
- `src/content/blog/how-to-find-trusted-caregiver-trinidad-tobago.mdx`
- `src/content/blog/senior-care-costs-trinidad-tobago-2026.mdx`
- `src/content/blog/when-help-feels-like-pressure.mdx`
- `src/content/blog/why-families-resist-care.mdx`
- `src/pages/blog/BlogIndexPage.tsx`
- `src/pages/blog/BlogPostPage.tsx`
- `src/components/blog/BlogCard.tsx`
- `src/components/blog/BlogCategoryFilter.tsx`
- `src/lib/blog.ts` — frontmatter loader + post list

**Edited (additive only):**
- `src/components/routing/AppRoutes.tsx` — 2 new `<Route>` entries
- `public/sitemap.xml` — append 5 entries
- `public/llms.txt` — append blog index + 4 posts under Pages
- `vite.config.ts` — register MDX plugin
- `tailwind.config.ts` — add `@tailwindcss/typography` plugin
- `package.json` — add `@mdx-js/rollup`, `@mdx-js/react`, `gray-matter`, `@tailwindcss/typography`

### Out of scope (deliberately)

- No CMS, no Supabase table, no admin UI for blog management
- No author profiles / bylines beyond a static "Tavara Care Team"
- No newsletter capture, no comments, no related-posts ML
- No hero images generated yet — can add in a follow-up pass with imagegen
- No changes to `App.tsx`, auth, registration, dashboard, or chat flow code

### After publish

Once shipped + deployed, I'll resubmit the sitemap to GSC via the connector so Google picks up the 5 new URLs immediately.

### Confirm before I build

1. Are these the right 4 articles, or swap one (e.g. Dementia in, Resistance out)?
2. OK with MDX + Tailwind typography stack? (Alternative: keep posts as TSX components — simpler, no new deps, but worse authoring ergonomics for future posts.)
3. Author byline: "The Tavara Care Team" OK, or a specific name?
