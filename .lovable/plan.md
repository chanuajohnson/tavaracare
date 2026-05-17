## Plan: Add new blog post as draft

### What

Insert a new row into `blog_posts` with `status = 'draft'` so you can review and publish from `/admin/blog`.

### Post metadata

- **Slug:** `how-to-talk-to-family-about-getting-caregiver`
- **Title:** How to Talk to Your Family About Getting a Caregiver
- **Category:** Emotional Realities (matches existing `Emotional Realities of Care` category — will confirm exact string from existing rows)
- **Description (≤160 chars):** "Care conversations are rarely just about a caregiver. A Caribbean family guide to talking about help with dignity, patience, and trust."
- **Reading time:** ~8 min read (auto-estimated)
- **Author:** Chanua Johnson, Tavara Care Coordinator & Founder (defaults)
- **CTA:** "Talk to Tavara" → `/` (or chat route — will use the same CTA pattern your other posts use)
- **FAQs:** none for this one (it's a narrative essay, not a how-to)
- **Status:** `draft`, `published_at: null`

### Internal links (all 3 references exist, will be linked)

The closing "We've written more about…" section links to:
- "When Help Feels Like Pressure" → `/blog/when-help-feels-like-pressure`
- "Why Families Resist Care at First" → `/blog/why-families-resist-care`
- "The Family Readiness Quiz" → `/blog/family-readiness-quiz-trinidad-tobago`

### Body formatting

- Convert to markdown with H2 (`##`) for the major section headings ("Why families avoid the conversation", "Why timing matters", "The mistakes families often make", "What actually works", "What Tavara has learned", "A few phrases that help", "One last thing").
- Convert bullet groups (independence/identity/aging/etc.) to `-` lists.
- Use `> [!LEARNED]` directive for the "What Tavara has learned" closing reflection so it renders in the editorial "What Tavara has learned" callout block.
- Use `---` divider before the closing CTA paragraph.
- Strip any em/en-dashes (per writing-style guardrail) — rewrite as commas or sentence breaks.

### Language guardrail pass

The source copy already uses "support / help / loved one / household" language. I'll do one pass to make sure no banned terms slipped in ("hire", "staff", "client", em-dashes, "journey", etc.) before insert.

### How it's inserted

Single `INSERT INTO blog_posts (...) VALUES (...)` via the insert tool. No schema changes, no migration. After insert, post appears in `/admin/blog` as a draft — you click "Edit" to review, then toggle status to "published" when ready.

### Out of scope

- No code changes.
- No SSG prerender list update (drafts aren't public; when you publish, `/blog/[slug]` is already covered by the existing dynamic blog route — SSG only prerenders the marketing/landing routes, not individual blog posts).
- No changes to `BlogPostPage`, navigation, or routing.
