## Tavara blog — editorial pass + 3 new spin-offs

Two parallel workstreams shipped in one pass: editorial polish on what's live, plus three new emotionally-intelligent essays that extend Tavara's moat (experience-based care writing, T&T-specific).

### Workstream A — Editorial UI kit

Add reusable markdown components so every post (existing + new) gets magazine-style rhythm.

New file: `src/components/blog/editorial.tsx` exports:
- `<PullQuote>` — large italic blockquote, left border in `primary`, used for the memorable lines ("Resistance is not a rejection of care. It's usually an attempt to protect identity.")
- `<TavaraLearned>` — "What Tavara Has Learned" callout box. Soft `primary-100/40` bg, label chip top-left.
- `<Observation>` — single-line highlighted emotional observation strip (left accent bar, muted bg).
- `<SectionDivider>` — centered three-dot ornament for breathing room between major beats.
- `<DropCap>` — first-paragraph drop-cap wrapper for the opener.

Wired into `BlogPostPage.tsx` via `ReactMarkdown` `components` prop using custom HTML comment / directive tags inside the markdown body. Approach: extend `posts.ts` `BlogPost` so each post can optionally declare structured `blocks` (richer than raw markdown). Markdown stays the default; new posts use blocks for full editorial layout. Existing 4 posts get blocks added post-tightening.

Typography: add drop-cap CSS and prose tweaks in `src/index.css` scoped under `.prose-editorial`. No global token changes.

### Workstream B — Tighten the existing 4

Editorial pass on each post in `src/content/blog/posts.ts`:
1. **How to Find a Trusted Caregiver in T&T** — already tight, mostly add 2-3 pull quotes + one TavaraLearned callout.
2. **Senior Care Costs in T&T 2026** — add a comparison callout, pull quote on transparency.
3. **When Help Feels Like Pressure** — cut ~15-20% loops (resistance/identity/privacy repeat). Add 3 pull quotes, 2 TavaraLearned blocks, dividers between emotional beats.
4. **Why Families Resist Care at First** — same tightening pass. This is the longest looper.

Target: each post reads 15-20% shorter, hits harder, scans cleanly on mobile.

### Workstream C — 3 new spin-off articles

Written in the observed Tavara voice (observant, calm, culturally grounded, compassionate-not-soft). 1,800-2,400 words each. Full editorial-block layout from day one. Each ships with FAQs, JSON-LD schemas (auto via existing `BlogPostPage`), CTA, internal links to `/family`, `/urgent-families`, `/support/faq`, and cross-links to existing posts.

**1. Hoarding, Overwhelm & Aging: The Hidden Caregiving Challenge Nobody Talks About**
- Category: Emotional Realities of Care
- Slug: `hoarding-overwhelm-aging-hidden-caregiving-challenge`
- Hook: "The home is not just a structure. For many aging parents, it is memory, identity, grief, survival, and proof of a life lived."
- Beats: emotional attachment to objects, identity-as-home, transition psychology, caregiver shame, readiness pacing, how Tavara approaches a first home visit.
- CTA: Talk to Tavara → `/family`

**2. The Adult Child Trap: Caring for a Parent While Quietly Burning Out**
- Category: Emotional Realities of Care
- Slug: `adult-child-trap-caring-for-parent-burnout`
- Hook: "You love your parent deeply. And some days you resent the entire situation. Both things can be true at once."
- Beats: Caribbean eldest daughters, diaspora children, sandwich generation, sibling imbalance, the guilt/resentment loop, what relief actually looks like.
- CTA: Find Care → `/urgent-families`

**3. Caribbean Families and Caregiving: Why This Conversation Is So Hard**
- Category: Emotional Realities of Care
- Slug: `caribbean-families-and-caregiving-why-this-is-hard`
- Hook: respectability culture, "we handle our own," pride, religion, privacy, multigenerational expectations, diaspora guilt.
- Beats: cultural framing, why outside help feels like exposure, how families move through it, Tavara's coordination model as a bridge rather than a replacement.
- CTA: Talk to Tavara → `/family`

### Files touched

**New:**
- `src/components/blog/editorial.tsx` — PullQuote, TavaraLearned, Observation, SectionDivider, DropCap

**Edited:**
- `src/content/blog/posts.ts` — tighten 4 existing posts, add 3 new posts, extend `BlogPost` type with optional `blocks` field
- `src/pages/blog/BlogPostPage.tsx` — wire editorial components into ReactMarkdown renderer; render `blocks` when present
- `src/index.css` — `.prose-editorial` scoped drop-cap + spacing
- `public/sitemap.xml` — append 3 new URLs
- `public/llms.txt` — append 3 new blog entries under Blog
- `.lovable/plan.md` — update with shipped batch

### Out of scope (explicit)

- Posts 4 ("We Think You Need Help") and 5 ("First Month of Care") from your list of 6 — held for a follow-up batch. Better to ship 3 strong than 5 rushed (same logic as before).
- No hero images yet (imagegen pass can follow once copy is signed off).
- No CMS, no Supabase tables, no admin UI for blog. Static data layer stays.
- No nav changes. No App.tsx changes. Strictly additive.

### After publish

Resubmit `sitemap.xml` to GSC via the connector so Google picks up the 3 new URLs (you confirmed connection earlier).
