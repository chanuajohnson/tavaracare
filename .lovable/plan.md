## Make the reader "copy link" share a clean tavara.care URL

You picked the tradeoff: clean link in WhatsApp/iMessage, accept that the link preview card will fall back to the sitewide Open Graph defaults (Tavara name + sitewide image) instead of the per-article title/image.

### What changes

**File:** `src/lib/blog/shareUrl.ts`

Point `getBlogShareUrl` at the canonical article URL on tavara.care instead of the Supabase edge function. The UTM helper keeps working unchanged because it just decorates whatever base URL is returned.

```text
// Before
export function getBlogShareUrl(slug: string): string {
  return `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/blog-share/${slug}`;
}

// After
export function getBlogShareUrl(slug: string): string {
  return `https://tavara.care/blog/${slug}`;
}
```

Drop the now-unused `SUPABASE_PROJECT_ID` constant and its import-meta env read in the same file. Update the docblock to reflect the new behavior (clean human link, helmet-based preview, sitewide OG fallback on non-JS crawlers).

### What still works the same

- Reader's "Copy to share" button on `BlogPostPage.tsx` still copies a UTM-stamped URL — now `https://tavara.care/blog/<slug>?utm_source=share-button&utm_medium=blog-share&utm_campaign=<slug>&utm_content=copy-button`.
- Tracking: `trackBlogCtaClick({ placement: "public-copy-share" })` still fires; the landing on the article still fires `blog_utm_landed` because the URL carries UTMs.
- Admin "Copy share link" buttons (`AdminBlogEditorPage.tsx`) use the same helper, so they also get the clean URL.
- The `blog-share` edge function is left in place and continues to work for any older share URLs already in the wild; we just stop generating new ones that point at it.

### What changes for crawlers

- WhatsApp/iMessage/LinkedIn/Slack/Facebook will now show the **sitewide** Open Graph card from `index.html` (Tavara logo + default description), not the per-article card. That's the explicit tradeoff you chose.
- Google and other JS-executing crawlers still see the per-article meta via react-helmet-async on the SPA route, so SEO is unaffected.

### Out of scope (left untouched, per protected-files rules)

- `supabase/functions/blog-share/index.ts` — unchanged; old shares still resolve.
- `BlogPostPage.tsx`, `BlogInlineCTA.tsx`, `BlogEndCTABlock.tsx`, `BlogStickyMobileCTA.tsx` — unchanged.
- `attribution.ts`, `PageViewTracker.tsx`, analytics dashboard — unchanged.
- No DNS, no Supabase custom domain, no edge function redeploy.

### Verification after build

1. Open any blog post (e.g. `/blog/senior-care-costs-trinidad-tobago-2026`), click the share button.
2. Toast confirms copied, paste somewhere: URL reads `https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=share-button&utm_medium=blog-share&utm_campaign=...&utm_content=copy-button`.
3. Paste into WhatsApp — preview card shows the sitewide Tavara OG (expected).
4. Click the preview from another device — lands on the article, `cta_engagement_tracking` records a `blog_utm_landed` row with `utm_source=share-button`.

### Files

- `src/lib/blog/shareUrl.ts` — body of `getBlogShareUrl`, remove unused const, refresh docblock. ~10-line diff.

Reminder: visual-only tweaks like this kind of swap can be made for free via Visual Edits when they're literal text/color changes — for logic like this, code edit is the right call.
