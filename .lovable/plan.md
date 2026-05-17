## Plan: Automatic internal-link validation for blog posts

### Goal

When editing a blog post in `/admin/blog/:id`, scan the body markdown for internal links and flag any that point to slugs/routes that don't exist, before publish.

### What counts as an "internal link"

Any markdown link `[text](href)` where `href`:

- starts with `/` (relative), OR
- starts with `https://tavara.care` or `https://tavaracare.lovable.app` (treat as relative after stripping the host)

External links (other domains), `mailto:`, `tel:`, anchors (`#foo`), and `javascript:` are ignored.

### Validation rules per link

1. **Blog links** — `^/blog/([a-z0-9-]+)/?$` → check `blog_posts.slug` exists AND `status = 'published'`. Three states:
   - **OK** — slug exists and is published.
   - **Warning** — slug exists but is `draft` / `scheduled` / `hidden` (will 404 for public).
   - **Error** — no row with that slug.
2. **App routes** — any other `/...` path → check against the static route list extracted from `src/components/routing/AppRoutes.tsx`. A small allow-list of well-known dynamic prefixes (`/urgent/`, `/care/`, `/services/`, `/dashboard/`, `/admin/`, `/registration/`) is treated as valid without deep matching. Unknown paths surface as a **Warning** (not error — admin may know better than the static parser).
3. **Duplicate-href detection** is out of scope.

### New files

1. **`src/lib/blog/linkValidation.ts`** — pure utilities:
   - `extractInternalLinks(body: string): { href: string; text: string; line: number }[]` — regex pass over markdown.
   - `KNOWN_ROUTES: Set<string>` — hand-curated list of top-level public routes (`/`, `/about`, `/faq`, `/features`, `/blog`, `/urgent-families`, `/care/port-of-spain`, etc.) lifted from `AppRoutes.tsx` + `locationsData.ts` + `servicesData.ts`. One-time static export, easy to extend.
   - `DYNAMIC_PREFIXES: string[]` — `['/blog/', '/urgent/', '/care/', '/services/', '/dashboard/', '/admin/', '/registration/']`.
   - `classifyRoute(href): 'blog-slug' | 'known-route' | 'dynamic-allowed' | 'unknown'`.

2. **`src/hooks/admin/useBlogLinkValidation.ts`** — React Query hook:
   - Input: `body: string`.
   - Extracts internal links, collects unique blog slugs, runs ONE query: `select slug, status from blog_posts where slug in (...)`.
   - Returns `{ issues: LinkIssue[]; errorCount: number; warningCount: number; isLoading: boolean }` where `LinkIssue = { href, text, line, severity: 'error' | 'warning', reason: string }`.
   - Debounced/memoized on body so it doesn't re-fetch on every keystroke.

3. **`src/components/admin/blog/BlogLinkValidationPanel.tsx`** — Card component rendered inside the editor's right sidebar (same column as the Guardrail scan summary). Shows:
   - Counter: `X errors / Y warnings`.
   - List of issues with line number, link text, href, reason, and a "Copy" affordance.
   - Empty state: "All N internal links resolve."

### Edit to existing file

**`src/pages/admin/AdminBlogEditorPage.tsx`** (minimal, additive):

1. Import the hook + panel.
2. `const linkCheck = useBlogLinkValidation(body);`
3. Render `<BlogLinkValidationPanel result={linkCheck} />` directly above the existing Guardrail scan summary card (line ~541).
4. Extend the Publish + Schedule button disabled conditions:
   - `disabled = ... || linkCheck.errorCount > 0`
   - Update the `title` tooltip to mention link errors when present.
   - Toast message in the Publish handler: `"Cannot publish — N broken internal link(s) detected"`.
5. Warnings do **not** block publish (consistent with guardrail soft warnings).

No routing changes, no edits to `App.tsx`, `AuthProvider`, registration, chat, dashboards, or core systems.

### Out of scope

- Validating external (off-domain) URLs by HTTP HEAD — too slow and noisy.
- Auto-fixing broken links.
- Validating links inside `description`, `cta_href`, or FAQ answers (can be a v2 — current scope is body only, where the cross-links live).
- Schema changes — purely client-side validation against existing `blog_posts` reads.

### Verification

After implementing, open the new draft post (`/admin/blog/8dea7301-...`) and confirm the panel shows "All 3 internal links resolve." Then temporarily edit one link to `/blog/does-not-exist`, save, and confirm:
- panel flips to "1 error",
- Publish button is disabled with the correct tooltip,
- Re-fixing the link clears the error.
