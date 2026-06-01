## Goal

Stop needing Lovable chat to author blog posts. Add a self-serve "AI Draft" flow on `/admin/blog` where you describe a topic + angle, and the system:

1. Researches existing posts in the DB for structure & voice
2. Generates a guardrail-clean draft (title, slug, description, category, body markdown, FAQs, CTA, reading time)
3. Lets you preview/edit before saving as a draft post in `blog_posts`
4. Surfaces what supporting source files (`sitemap.xml`, `llms.txt`, `posts.ts`) still need a Lovable sync

Scope is admin-only and additive — no changes to existing blog rendering, posts.ts, guardrails table, or publishing flow.

## UI changes (admin only)

`src/pages/admin/AdminBlogPage.tsx`
- Add a third button next to "New post": **"AI Draft"** (Sparkles icon)
- Clicking opens a new modal `AiDraftBlogDialog`

`src/components/admin/blog/AiDraftBlogDialog.tsx` (new)
- Form fields:
  - **Topic** (required, textarea) — e.g. "What the nurse actually cooks"
  - **Angle / key points** (textarea) — voice-note style brain dump
  - **Category** (select, reuses existing 3 categories)
  - **Target audience** (select: family / caregiver / community, default family)
  - **CTA** (label + href, prefilled `Find Care Now → /urgent-families`)
  - **Reference posts** (auto-picked top 3 from same category, shown as chips, removable)
- "Generate draft" button → calls edge function, shows streaming/loading state
- Result preview pane: editable title, slug, description, FAQs, full markdown body, reading time
- Inline guardrail check: runs the existing banned-term scan from `language_guardrails` client-side against the generated body and flags hits before save
- "Save as draft" → uses existing `useSavePost` mutation with `status: "draft"`; redirects to `/admin/blog/{id}` editor
- "Regenerate" → re-calls edge fn with the same inputs + a "what to change" note

## Edge function (new): `supabase/functions/blog-ai-draft/index.ts`

- POST body: `{ topic, angle, category, audience, ctaLabel, ctaHref, referencePostIds[], revisionNote? }`
- Auth: requires admin (verify via `user_roles`)
- Pulls:
  - The active guardrails from `language_guardrails` (banned terms + preferred replacements)
  - Body + structure of `referencePostIds` from `blog_posts` (for voice/section pattern)
  - The brand snippets at `docs/TAVARA_WRITING_STYLE.md` + `docs/TAVARA_LANGUAGE_GUARDRAILS.md` (inlined as constants so the function stays self-contained)
- Calls Lovable AI Gateway (`LOVABLE_API_KEY`, model `google/gemini-2.5-flash`) with a structured-output JSON schema:
  ```
  { title, slug, description, body, faqs:[{q,a}], readingTime, suggestedCategory }
  ```
- Post-processing on the function side:
  - Strip em/en-dashes (`—`, `–` → `, `)
  - Reject any banned term match → return `{ violations: [...] }` so UI shows them
  - Ensure slug is kebab-case, unique-ish (suffix with random 4 chars if collision)
- Returns the draft JSON; **does not insert** — UI does the insert via existing `useSavePost`

Secrets needed: `LOVABLE_API_KEY` (already enabled via Lovable Cloud).

## Supporting files notice

`posts.ts`, `public/sitemap.xml`, `public/llms.txt` are source-controlled and cannot be written from the browser. After a draft is published, the admin page shows a yellow callout: **"Ask Lovable to sync sitemap.xml, llms.txt, and posts.ts for this post"** with a copyable one-line prompt that includes the new slug. (Future enhancement: dynamic `/sitemap.xml` route reading from DB — out of scope for this plan.)

## Files to add / edit

```
Add:    supabase/functions/blog-ai-draft/index.ts
Add:    src/components/admin/blog/AiDraftBlogDialog.tsx
Edit:   src/pages/admin/AdminBlogPage.tsx        (button + dialog wiring only)
```

No DB migration. No routing changes. No edits to posts.ts, sitemap.xml, llms.txt, AuthProvider, chat flow, or registration files.

## Verification

1. Open `/admin/blog`, click "AI Draft", enter a topic, generate → preview renders within a few seconds
2. Inline guardrail flags any banned term in red before save
3. Save → new row appears in `blog_posts` with `status='draft'`, opens in existing editor
4. Publish from the existing editor — post is live at `/blog/{slug}`
5. Yellow sync-reminder callout appears with the slug ready to copy
