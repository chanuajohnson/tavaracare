## Blog: backdated cadence + full admin CMS

Two parts. Part 1 is a quick data fix. Part 2 is the real build: migrate static posts to Supabase and ship an admin page.

---

### Part 1 — Backdate the 7 existing posts (biweekly cadence, Jan → May 2026)

All 7 posts currently share `publishedAt: "2026-05-17"`. Reassign on a roughly biweekly cadence, oldest first (the high-intent SEO pieces lead, the emotional pieces follow):

| Order | Slug | New date |
|---|---|---|
| 1 | how-to-find-trusted-caregiver-trinidad-tobago | 2026-01-14 (Wed) |
| 2 | senior-care-costs-trinidad-tobago-2026 | 2026-01-28 |
| 3 | why-families-resist-care | 2026-02-18 |
| 4 | when-help-feels-like-pressure | 2026-03-11 |
| 5 | caribbean-families-and-caregiving-why-this-is-hard | 2026-04-01 |
| 6 | adult-child-trap-caring-for-parent-burnout | 2026-04-22 |
| 7 | hoarding-overwhelm-aging-hidden-caregiving-challenge | 2026-05-13 |

These dates apply both to the static seed (Part 2 migration) and update the schema.org `datePublished`. Index page sort order stays newest-first.

---

### Part 2 — Blog admin CMS (Supabase-backed)

#### A. Database (new tables)

**`blog_posts`** — single source of truth, replaces `src/content/blog/posts.ts`
- Fields: `id`, `slug` (unique), `title`, `description`, `body` (markdown), `category` (enum text: 'SEO Guides' | 'Emotional Realities' | 'Family Guides'), `reading_time`, `author_name`, `author_role`, `author_avatar_url`, `cover_image_url` (nullable, future-proof), `cta_label`, `cta_href`, `faqs` (jsonb array of `{q,a}`), `status` ('draft' | 'scheduled' | 'published' | 'hidden'), `published_at` (timestamptz, used for both publish date and scheduled time), `created_at`, `updated_at`

**RLS**
- Public SELECT: only rows where `status = 'published'` AND `published_at <= now()`
- Admin SELECT/INSERT/UPDATE/DELETE: requires `has_role(auth.uid(), 'admin')` (existing helper)

**Storage**
- New bucket `blog-assets` (public read) for author avatars + future cover images. Admin-only write via policy.

**Seed migration**
- Insert all 7 posts from `posts.ts` with the new backdated dates, status `published`, author = Chanua Johnson, avatar_url pointing to `/src/assets/chanua-johnson.jpg` re-uploaded to the bucket (script step).

#### B. Frontend reads (public blog)

- Replace static `blogPosts` import in `BlogIndexPage` and `BlogPostPage` with a Supabase query hook (`useBlogPosts`, `useBlogPost(slug)`).
- Keep the existing editorial markdown renderer, FAQ section, SEO tags, schema.org — only the data source changes.
- Keep `src/content/blog/posts.ts` temporarily as a fallback during the migration window, delete once the DB is live and verified.

#### C. Admin page — `/admin/blog`

New route + sidebar link. Two screens:

**1. Post list (`/admin/blog`)**
- Table: title, status badge (Draft / Scheduled / Published / Hidden), category, author, published_at, actions
- Filters: status, category, search by title
- Actions per row: Edit, Hide/Unhide toggle, Duplicate, Delete (confirm)
- Top bar: "New post" button → editor

**2. Post editor (`/admin/blog/:id` and `/admin/blog/new`)**
- Form fields:
  - Title (autogenerates slug, slug editable)
  - Slug (lowercase-hyphen validation)
  - Description (160 char counter for SEO)
  - Category (select)
  - Reading time (auto-estimate from body word count, override)
  - **Author block**: name, role, avatar (upload to `blog-assets` bucket via existing supabase storage helper, preview circle)
  - Cover image (upload, optional)
  - Body: markdown textarea with live preview pane (split view, mobile stacks). Reuses the `prose-editorial` styles + editorial directives (`> [!LEARNED]`, `> [!OBSERVATION]`, `---`, `>` pull quote) with a small cheat-sheet panel showing the syntax
  - CTA: label + href
  - FAQs: repeatable list of `{q, a}` rows, add/remove/reorder
  - **Status & schedule**:
    - Status dropdown: Draft / Scheduled / Published / Hidden
    - Published at: datetime picker. If status = Scheduled and date is future, public site treats as not yet live (RLS handles this).
- Actions: Save draft, Publish now (sets status published + published_at = now), Schedule (status scheduled + future date), Hide, Delete

#### D. Writing-style guardrails inside the editor

- Pre-save lint warning panel (non-blocking) that scans the body for: em-dashes (—/–), banned words (delve, leverage, holistic, etc. from `docs/TAVARA_WRITING_STYLE.md`), "It's not just X, it's Y" pattern. Shows count + line context. Lets admin save anyway.

#### E. Routing & nav

- Add route `/admin/blog` and `/admin/blog/:id` in `AppRoutes.tsx` under existing admin guard
- Add "Blog" entry to admin sidebar (`AdminDashboard` sidebar items) with `FileText` icon

---

### Out of scope (this round)
- Multi-author management screen (just store author fields per-post for now; refactor to authors table if needed later)
- Rich-text WYSIWYG (markdown stays — matches the editorial component contract)
- Comments, likes, view counts, related-post manual overrides
- RSS feed, email digest (sitemap.xml stays static, manually updated)
- Image optimization pipeline
- Versioning / revision history
- Tag system (category covers it for now)

### Questions before I build
1. **Scheduling worker**: do you want scheduled posts to auto-go-live based purely on the RLS `published_at <= now()` check (simple, no cron)? Or a visible "auto-publish" worker? I'd recommend the RLS approach — zero infra, posts appear the moment their timestamp passes.
2. **Sitemap.xml**: rebuild it on every publish via an edge function, or leave it static for now and regenerate manually?
3. **Cover images**: build the upload UI now or defer until you decide on a visual treatment?
