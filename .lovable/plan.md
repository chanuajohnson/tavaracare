## Goal

Add a single-post **Regenerate audio (with word timings)** control to the admin blog editor page (`/admin/blog/:id`) so you can refresh narration one post at a time — starting with `know-someone-who-needs-care-trinidad-tobago` — without burning ElevenLabs quota on the other 10 posts.

No changes to the edge function, the bulk backfill button, or the public reader.

## Scope

**Files touched (1 new, 1 edited):**

1. **NEW** `src/components/admin/BlogAudioRegenButton.tsx` — small card-style control
2. **EDIT** `src/pages/admin/AdminBlogEditorPage.tsx` — mount the new control once

**Untouched:** edge function `blog-tts-generate`, `BlogAudioBackfillButton`, `BlogAudioPlayer`, `BlogReadingContext`, `BlogPostPage`, routing, schema.

## What the new control does

A compact panel on the editor page showing:

- Current audio status (pulled from `blog_audio` row for this post): "Audio ready · generated <date>" / "Has word timings: yes/no" / "No audio yet"
- A **Regenerate audio** button → calls the existing `blog-tts-generate` edge function with `{ post_id, slug, force: true }`
- Inline result: ✓ "Generated · X words timed" or ⚠ reason (`quota_exceeded`, `unusual_activity_lock`, etc.) returned verbatim from the function
- Loading spinner while in flight
- A "Play preview" link that opens the post's public URL in a new tab so you can verify the karaoke highlight works

No new tables, no new edge function, no schema changes. It reuses the exact same invocation contract the bulk button already uses, so the existing `word_timings` + `narration_text` persistence path is identical.

## Placement

Top of the editor page, just under the page title / breadcrumbs. Single card, full width on mobile, capped width on desktop. Uses semantic tokens (`bg-card`, `border-border`, `text-muted-foreground`, `text-primary`) — no hard-coded colors.

## How you'll test

1. Open `/admin/blog/<id of know-someone-who-needs-care-trinidad-tobago>`
2. Click **Regenerate audio** → wait for ✓
3. Open `/blog/know-someone-who-needs-care-trinidad-tobago` → press Play on the audio player → confirm words highlight as they're read
4. If ElevenLabs still returns `quota_exceeded`/`unusual_activity_lock`, the control surfaces that reason clearly so you know it's an account issue, not a code issue

## Out of scope

- Auto-skip of already-done posts in the bulk button (your earlier option b) — not doing it this round
- Any change to the highlight rendering itself
- Any change to chat flow, routing, registration, or other protected areas

## Technical notes

- The new component reads one row from `blog_audio` filtered by `post_id` to show status — single `.select().eq().maybeSingle()`, no listing
- Invokes `supabase.functions.invoke("blog-tts-generate", { body: { post_id, slug, force: true } })` — same call shape as bulk button
- After success, re-reads the `blog_audio` row so the status line reflects the new `word_timings` length
- Uses sonner toast for success/error consistent with the rest of admin