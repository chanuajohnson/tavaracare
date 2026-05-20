# AI Social Share Generator (per blog post)

Adds an emotionally intelligent, platform-aware social caption generator + UTM link builder to the admin blog editor at `/admin/blog/:id`. Every generated link is logged for attribution analytics.

## Scope (locked from your answers)

- Lives in the **blog editor only** (per post panel)
- AI generates **caption/post copy only** (no hooks/hashtags pack)
- AI **suggests** campaign + utm_content slug; admin can override before copy
- Every generated link is **stored** in a new tracking table

Platforms: Facebook, Instagram, WhatsApp, TikTok, LinkedIn.

## What the user sees

New "Social share" panel on `/admin/blog/:id`, below the existing "Copy share link" buttons.

```text
+-- Social share -----------------------------------------+
| Platform: [FB] [IG] [WhatsApp] [TikTok] [LinkedIn]      |
|                                                         |
| Campaign: [family-readiness          v]  (AI suggested) |
| Content:  [when-help-feels-pressure   ]  (editable)     |
|                                                         |
| Caption:                                                |
|  ----------------------------------------------------   |
|  | <AI-generated, tone-tuned per platform>          |   |
|  ----------------------------------------------------   |
|  [ Regenerate ]                                         |
|                                                         |
| UTM link (auto-built, live preview):                    |
|  https://tavara.care/blog/<slug>?utm_source=...         |
|                                                         |
| [ Copy caption + link ]   [ Copy link only ]            |
+---------------------------------------------------------+
```

Behavior:
- Pick a platform → AI generates a tone-matched caption + suggests campaign and content slug
- Admin can edit campaign (preset dropdown) and content slug (text) before copying
- Caption is editable too; "Regenerate" calls AI again with current platform
- Copy buttons log the link to the tracking table with `copied_at`

## Tone rules (enforced in system prompt)

Inherits `mem://preferences/writing-style` + `mem://constraints/tavara-language-guardrails`:
- No em/en-dashes, no AI buzzwords, no "not just X, it's Y"
- Never "hire / patient / agency / client / staff"; always "arrange care / loved one / family / care team"
- Per-platform voice:
  - **Facebook** — longer reflective storytelling, family/community
  - **Instagram** — short emotional resonance, carousel-friendly lines, ends with "Link in bio"
  - **WhatsApp** — short, personal, like forwarding to a friend; no corporate phrasing
  - **TikTok** — strong hook + truth + "Full article in bio"
  - **LinkedIn** — thoughtful systems/infrastructure framing, professional but human

## UTM structure

```
https://tavara.care/blog/<slug>?utm_source=<platform>&utm_medium=social&utm_campaign=<campaign>&utm_content=<content>
```

- `utm_source` fixed per platform (`facebook`, `instagram`, `whatsapp`, `tiktok`, `linkedin`)
- `utm_medium` always `social`
- `utm_campaign` from preset list (lowercase, hyphenated): `family-readiness`, `caregiver-awareness`, `care-coordination`, `caregiver-burnout`, `aging-in-place`, `blog-launch`
- `utm_content` AI-suggested slug derived from post title + platform (e.g. `when-help-feels-pressure-fb`)

Reuses existing `generateUTMLink` in `src/utils/utmTracking.ts` (already there). Capture side already exists via `captureUTMParams` on landing.

## Tracking table

```sql
social_share_links (
  id uuid pk,
  post_id uuid fk blog_posts,
  platform text,           -- facebook|instagram|whatsapp|tiktok|linkedin
  campaign text,
  content_slug text,
  full_url text,
  caption text,
  generated_by uuid,       -- admin user
  generated_at timestamptz default now(),
  copied_at timestamptz    -- set when admin clicks Copy
)
```

RLS: admins only (via `has_role(auth.uid(),'admin')`) for select/insert/update.

Future: join `utm_campaign` captured in `user_journey` against this table to attribute registrations to specific generated links.

## Technical implementation

### New files
- `supabase/migrations/<ts>_social_share_links.sql` — table + RLS
- `supabase/functions/generate-social-caption/index.ts` — calls Lovable AI Gateway (`google/gemini-3-flash-preview`), returns `{ caption, suggestedCampaign, suggestedContentSlug }`. System prompt embeds tone guardrails + platform context + post title/description.
- `src/components/admin/blog/SocialSharePanel.tsx` — the UI panel
- `src/lib/blog/socialCampaigns.ts` — campaign preset constants + slugify helper

### Touched files
- `src/pages/admin/AdminBlogEditor.tsx` (or wherever `/admin/blog/:id` lives — confirm during build) — mount `<SocialSharePanel post={post} />` below existing share buttons. No routing or layout changes.
- `src/utils/utmTracking.ts` — already exports `generateUTMLink`; reuse as-is.

### Edge function contract

Request: `{ postId, platform }`  
Response: `{ caption: string, suggestedCampaign: string, suggestedContentSlug: string }`

Function loads the post server-side, builds a tone-tuned prompt per platform, returns JSON via AI SDK `Output.object` schema.

## Out of scope (intentionally)

- Hook variants, hashtag packs, image generation
- Standalone `/admin/social-share` page for non-blog URLs
- Scheduling/posting to platforms (copy-paste only)
- Analytics dashboard for generated links (table exists; surface later)
- Any change to chat flow, registration, routing, AuthProvider, or other protected files

## Verification

1. Open `/admin/blog/<any-published-post>`, see Social share panel
2. Click each platform → caption regenerates with correct tone; UTM preview updates live
3. Edit campaign + content slug → URL updates
4. Click Copy → clipboard contains caption + URL; row appears in `social_share_links` with `copied_at` set
5. Paste link in browser → existing `captureUTMParams` stores UTM in localStorage on landing
6. Confirm no banned words appear in 5 sample captions per platform
