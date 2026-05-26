## Add comments + likes to blog posts

Per-post comment threads at 1/3, 2/3, and end of article + a single heart like count. Guest posting (name + email) with admin moderation.

### Body splitting

Change `BlogPostPage.tsx` body split from halves → thirds on paragraph boundaries:

```
thirdA  ─┐
         ├─ <BlogCommentsPrompt postSlug/>
thirdB  ─┤
         ├─ <BlogInlineCTA postSlug/> + <BlogCommentsPrompt postSlug/>
thirdC  ─┘
<BlogEndCTABlock postSlug/>
<BlogCommentsThread postSlug id="comments"/>
```

`BlogCommentsPrompt` is a compact card (heart + approved-count + "Join the conversation" + single-line input that focuses-scrolls to `#comments`). `BlogCommentsThread` is the full list + post form anchored at the bottom. Fallback: if body has <6 paragraphs, fall back to halves (one prompt + end thread).

### Data model (new tables)

**`blog_comments`**
- `id uuid pk`, `post_slug text not null`, `author_name text` (2-60), `author_email text` (≤120, validated, never rendered), `body text` (2-2000), `status text` default `'pending'` check in (`pending`,`approved`,`rejected`), `ip_hash text` (sha256 of IP + daily rotating salt), `created_at`, `approved_at`, `approved_by uuid`.
- Indexes on `(post_slug, status, created_at desc)` and `(ip_hash, created_at)`.

**`blog_post_reactions`**
- `id uuid pk`, `post_slug text not null`, `reaction_hash text not null` (sha256 of IP+UA+post_slug), `created_at`.
- Unique on `(post_slug, reaction_hash)`.

**RLS:**
- `blog_comments`: public has NO direct select/insert. Public reads through view `blog_comments_public` (`status='approved'`, returns `id, post_slug, author_name, body, created_at` — never email/ip_hash). Admin has full select/update/delete via `has_role(auth.uid(),'admin')`.
- `blog_post_reactions`: no public select/insert; counts read through view `blog_post_likes (post_slug, like_count)`. Admin full access.

### Edge functions (public, `verify_jwt=false`, CORS includes `x-client-env`)

- **`submit-blog-comment`** — POST `{ postSlug, authorName, authorEmail, body }`. Zod-validates lengths/email. Hashes IP with daily salt. Rate-limit: reject if same `ip_hash` has >3 pending in last 24h, or >1 submission to same `post_slug` in last 60s. Inserts with `status='pending'`. Returns `{ ok: true, status: 'pending' }`.
- **`toggle-blog-reaction`** — POST `{ postSlug }`. Computes `reaction_hash` from IP+UA+slug. Upsert/delete toggle. Returns `{ liked: boolean, like_count: number }`.

Both use the service role internally; never expose service key to client.

### Frontend pieces

- `src/hooks/useBlogComments.ts` — react-query: `useApprovedComments(slug)` (queries `blog_comments_public`), `useSubmitComment()` (calls edge fn, optimistic toast "Submitted for review").
- `src/hooks/useBlogReactions.ts` — `useLikeCount(slug)` (queries `blog_post_likes`), `useToggleLike(slug)` (calls edge fn + localStorage `blog_liked_<slug>` for UI persistence across reloads).
- `src/components/blog/BlogCommentsPrompt.tsx` — heart button + count + "Join the conversation" CTA that scroll-focuses `#comments`.
- `src/components/blog/BlogCommentsThread.tsx` — heading, approved list (name + date + body, no avatars), and post form (name, email, body, submit). Shows "Awaiting moderation" success state.
- Integrate in `src/pages/blog/BlogPostPage.tsx` (split into thirds + slot components).

### Admin moderation

Extend `src/pages/admin/AdminBlogPage.tsx` with a "Comments" tab:
- Lists pending comments across all posts (slug, name, email, body, submitted at).
- Per-row Approve / Reject / Delete buttons (writes through authenticated supabase client; RLS permits via `has_role`).
- Optional filter by status (pending/approved/rejected).

### Out of scope

- Threaded replies / edit-after-post / author edit links / email notifications / gravatar
- Multiple reaction types (only heart)
- Anything in `src/App.tsx`, routing, auth flow, chat flow, registration files

### Files touched

- New: `supabase/functions/submit-blog-comment/index.ts`, `supabase/functions/toggle-blog-reaction/index.ts`, `src/hooks/useBlogComments.ts`, `src/hooks/useBlogReactions.ts`, `src/components/blog/BlogCommentsPrompt.tsx`, `src/components/blog/BlogCommentsThread.tsx`
- Edited: `src/pages/blog/BlogPostPage.tsx` (thirds split + slot the new components), `src/pages/admin/AdminBlogPage.tsx` (Comments tab), `supabase/config.toml` (register the two new functions, no JWT)
- Migration: create both tables, views, RLS policies, indexes
