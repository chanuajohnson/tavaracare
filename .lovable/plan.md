## Auto-generate caption on copy if empty

**Scope:** `src/components/admin/blog/SocialSharePanel.tsx` only.

**Change:** Update `copyCaptionAndLink` so that if `caption` is empty/whitespace, it first runs the AI generation, awaits the result, then copies `caption + URL`. If generation fails, fall back to copying just the URL with a warning toast.

**Implementation:**
1. Refactor `generate()` to return the generated caption (so the copy handler can use the freshly returned value without waiting for React state).
2. In `copyCaptionAndLink`:
   - If `caption.trim()` is empty → call `generate()`, use the returned text.
   - Otherwise → use existing `caption` value.
   - Concatenate `${text}\n\n${utmUrl}`, write to clipboard, log to `social_share_links`.
3. Toast: "Caption generated and copied" when auto-generated, "Caption + link copied" otherwise.

**Out of scope:** No changes to edge function, schema, link button, or other panels.

**Verification:** Open a blog post, leave caption empty, click "Copy caption + link" → should show loading spinner briefly, then paste yields caption + tracked URL together; `social_share_links` row inserted with `caption` populated.