## Goal

Stop the AI-looking blog covers. Use your 16 real Trinidad photos as the source-of-truth style anchors, recreate each post's cover by editing from the topically-matching anchor, drop the cover in as a hero on every article page, and add a prompt-driven cover generator in the admin editor that always inherits from these anchors. Share previews (WhatsApp/Facebook/LinkedIn unfurls) keep working — they already pull per-post title + image via the `blog-share` edge function, so the new images flow through automatically.

## What I see in your 16 references (the Tavara photo rulebook)

Baked into every prompt and into the admin generator's hidden style preamble:

- iPhone-documentary feel. Slight grain. Neutral-to-cool white balance, never warm orange. Soft natural daylight from a window, no studio lighting, no stock-photo bokeh.
- Caribbean architectural cues. Decorative concrete-block screens, burglar-bar windows, white plastered walls, mahogany/teak rails and doors, parquet or terracotta floors, white subway or marble tile, drop ceilings, galvanized roofs, bougainvillea, pothos.
- Real wear. Cracks, scuffs, mismatched objects, dated fixtures, lived-in untidiness. Never magazine-staged.
- Care realism. Grab bars, mobility poles, commode chairs, home hospital beds with bed pads and mosquito nets, hand-holding, walking sticks, basins. Shown matter-of-factly, never glamorized.
- People. When hands or figures appear: dark-skinned T&T hands, ordinary cotton clothes. No scrubs, no Pinterest "caregiver in white" cliché.
- Avoid. Golden-hour beach shots, lab coats, glossy skin, drone palms, magazine staging, generic "tropical" shorthand.

## Anchor library — committed to the repo

Convert all 16 HEICs to JPG and store at `public/blog-style-refs/` (1000px-wide ~120-180 KB each, plus 400px thumbnails for the admin picker). These are the style anchors for both the one-time cover recreation and the admin generator going forward.

| Anchor | Subject |
| --- | --- |
| `ref-kitchen-window` | Hanging pothos + bougainvillea, subway tile, sink |
| `ref-stairwell-block` | Decorative-block window stairwell, turned mahogany balusters |
| `ref-front-door` | Wooden door + terracotta tile, mahogany rail, carved figurine |
| `ref-bedroom-pole` | Mobility pole next to four-poster bed, wooden floor, burglar-bar window |
| `ref-shower-grab` | Grab bar + handheld shower, marble subway tile, small high window |
| `ref-hospital-bed` | Home hospital bed, mosquito net, bed pad, drop ceiling |
| `ref-hallway-parquet` | Dark parquet hallway, yellow walls, hanging pendant |
| `ref-ornate-mirror` | Carved wooden mirror reflecting kitchen window + cabinets |
| `ref-held-hands-light` | Intergenerational held hands, pale shirt background |
| `ref-held-hands-dark` | Same theme, darker arm crossed, sage sheet |
| `ref-commode-bath` | Commode chair, basin, marble-tile bathroom |
| `ref-stairwell-panel` | Stairwell with mahogany balusters + framed sepia panorama |
| `ref-french-door` | Black-framed glass French door opening onto parquet living room |
| `ref-bathroom-tub-grab` | Full bathroom with tub, grab bar, drop ceiling, shower curtain |
| `ref-kitchen-window-2` | Sink + pothos + bougainvillea (second angle of `ref-kitchen-window`) |
| `ref-front-door-2` | Second angle of `ref-front-door` |

## Scope

### 1. Recreate the 6 existing blog covers

For each post, run `imagegen--edit_image` (Gemini 3 Pro Image — best at preserving the source photo's lighting and architecture) using the chosen anchor as the base. Output 1200x630 JPG. Overwrite the existing files in `public/blog-covers/<slug>.jpg` so OG share URLs and DB rows keep working without any change.

Topic → anchor mapping:
- Caring on a Public Holiday → `ref-kitchen-window` (calendar/holiday cue on counter)
- Live-in vs Hourly Care → `ref-bedroom-pole` (made bed, folded linen, soft daylight)
- Finding a Care Professional → `ref-held-hands-light` (caregiver + elder hands, neutral light)
- Dementia Care Costs → `ref-hallway-parquet` (one open door, quiet hallway)
- Paying for Care Without Going Broke → `ref-stairwell-panel` (notebook + pen on the landing ledge)
- Preparing Your Home for Care → `ref-bathroom-tub-grab` (grab bar + tub, ordinary bathroom)

I'll eyeball every output before committing and regenerate any that drift plasticky.

### 2. Hero image on each article page

In `src/pages/blog/BlogPostPage.tsx`, render `cover_image_url` as a full-width 16:9 hero above the title — rounded corners, `loading="eager"`, sensible mobile aspect. If a post has no cover, no hero. Pure presentation, no body-copy changes, no routing changes.

### 3. "Generate cover from prompt" in the admin editor

In `src/pages/admin/AdminBlogEditorPage.tsx`, beside the existing Upload/Replace buttons:
- New "Generate from prompt" button → opens a small dialog
- Textarea for the prompt, seeded from post title + description
- Anchor picker — radio grid of the 16 thumbnails; default is "Auto-pick by topic" which selects based on the post's category and topic keywords
- Hidden always-applied style preamble — injects the Tavara photo rulebook above and references the chosen anchor URL
- Edge function `generate-marketing-image` gets one new optional field `referenceImageUrl`; when present it switches the model to `google/gemini-3-pro-image-preview` and uses image-to-image. Existing call sites without a reference keep working unchanged.
- Output uploaded to the `blog-assets` Supabase bucket via existing `uploadBlogAsset`, then written into `coverImageUrl` for the post. Admin previews it inline before saving.

Every future cover the admin creates therefore inherits the Tavara photo rulebook automatically.

### 4. Share previews — no work needed

`supabase/functions/blog-share/index.ts` already serves per-post `og:title` + `og:image` from `cover_image_url`. Once the new files land in `public/blog-covers/`, WhatsApp/Facebook/LinkedIn unfurls show the new photo + the specific article title (not the generic Tavara home card). Crawler caches can take 24-48h; I can ping Facebook's URL debugger manually for any URL you want refreshed sooner.

## Out of scope (ask if you want any of these)

- Adding cover thumbnails to `/blog` index cards
- Adding cover thumbnails to the admin list table
- Changing typography/layout of the article body
- Editing the body copy of any of the 6 posts
- Touching routing, auth, registration, chat flow

## Technical notes

- Anchors: `public/blog-style-refs/<name>.jpg` (full) and `public/blog-style-refs/thumbs/<name>.jpg` (400px for the admin picker). Same-domain, cached, no Supabase storage write needed.
- Covers: stay in `public/blog-covers/<slug>.jpg` (existing convention).
- Admin-generated covers: go to the `blog-assets` Supabase bucket (already exists, already wired through `uploadBlogAsset`).
- One-time recreation of the 6 covers: agent-side `imagegen--edit_image`, committed to repo.
- Edge function `generate-marketing-image` change: one new optional field, backwards compatible, no DB migration, no RLS or grants change.
- Guardrails respected: no edits to `src/App.tsx`, routing, `Navigation.tsx`, `AuthProvider.tsx`, `FamilyRegistration.tsx`, or anything in `src/pages/registration/`. Chat flow files untouched.

## Verification before I tell you it's done

1. Eyeball each of the 6 recreated covers; regenerate any that look plasticky/AI.
2. Open `/blog/caring-on-a-public-holiday-trinidad-tobago` in preview (your 997x853 viewport) and on a mobile breakpoint; confirm the hero crops cleanly at 16:9.
3. Open `/admin/blog/<that-id>`, click Generate from prompt, pick an anchor, confirm the output reads as Trinidad-real and that it saves into the post.
4. Paste the live URL into WhatsApp web in a test chat; confirm the unfurl shows the new image + the specific post title (note 24-48h CDN cache for already-fetched URLs).
