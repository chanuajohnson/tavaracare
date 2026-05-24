## Goal

Three things, in one go:
1. Hand back the exact UTM-tracked links to share now (Diamond Vale + the current blog post), for WhatsApp-to-Scully, Facebook, and TikTok.
2. Produce two short vertical TikTok scroll-through videos — one for Diamond Vale, one for the blog post.
3. Make the existing UTM generator at `/admin/campaign-links` strong enough that future location/post/person/channel links take 10 seconds.

## 1. Links to send today

Destinations:
- Diamond Vale: `https://tavara.care/locations/diamond-vale`
- Blog: `https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago`

UTM convention (lock this in):
- `utm_source` = channel (`whatsapp`, `facebook`, `tiktok`)
- `utm_medium` = `dm` for WhatsApp, `social` for Facebook feed, `social-video` for TikTok
- `utm_campaign` = `scully-outreach` for the Scully sends, `founder-share` for the Facebook post, `tiktok-screenroll` for the TikTok videos
- `utm_content` = the asset slug (`diamond-vale` or `blog-know-someone`)

Six links delivered in chat:

```text
WhatsApp → Scully (Diamond Vale)
WhatsApp → Scully (Blog)
Facebook personal post (Diamond Vale)
Facebook personal post (Blog)
TikTok bio/caption (Diamond Vale)
TikTok bio/caption (Blog)
```

Each as a one-click WhatsApp `wa.me` link with prefilled message, plus the raw URL underneath for Facebook/TikTok paste.

## 2. Two TikTok scroll-through videos

Format: 9:16 vertical, 1080×1920, ~15s each, branded overlay (Tavara mark top-left, persistent `tavara.care/...` URL bottom, soft CTA card at the end).

Pipeline:
1. Capture a full-page screenshot of each live page (preview/prod) at desktop width, then a second pass at mobile width for crisp portrait framing.
2. Build a Remotion composition that pans the screenshot top→bottom with subtle ease, holds on the key block (hero / blog title / CTA), and ends on a 2-second "tavara.care/locations/diamond-vale" or "...blog/know-someone..." card.
3. Render two MP4s to `/mnt/documents/`:
   - `tavara-diamond-vale-tiktok.mp4`
   - `tavara-blog-know-someone-tiktok.mp4`

No voiceover — TikTok audio gets added in the TikTok editor. Muted MP4 is intentional.

## 3. Reusable UTM generator (extend the existing admin tool)

`/admin/campaign-links` already has `UTMLinkGenerator` + a signups-by-source table. Add:

- **Destination picker** (replaces the implicit "homepage"): tabs for `Location`, `Blog post`, `Custom URL`.
  - Location list pulled from `src/pages/locations/locationsData.ts` (Diamond Vale, Port of Spain, San Fernando, Arima, Tobago, …).
  - Blog list pulled from `blog_posts` where `status = 'published'`, ordered most recent.
- **Recipient field** (free text, e.g. "scully", "ria", "newsletter-may"): auto-feeds `utm_content` when channel is a DM, otherwise feeds `utm_term`.
- **Channel presets** that pre-fill source + medium + campaign in one click:
  - WhatsApp DM, Facebook personal, Facebook page, Instagram bio, Instagram story, TikTok caption, Email, LinkedIn.
- **Quick share row** under the generated URL: `Copy`, `Open WhatsApp` (uses `wa.me/?text=<prefilled>`), `Open Facebook sharer`, `Open X intent`.
- Keep the existing localStorage history; add a one-line note `"to: scully via whatsapp"` so past links are recognizable at a glance.

No DB schema change required — UTM data already lands in `cta_engagement_tracking.additional_data` via the existing tracker, and the leaderboard at `/admin/blog-analytics` and the table on `/admin/campaign-links` will show the new traffic automatically.

## Files touched

- `src/components/admin/UTMLinkGenerator.tsx` — add destination picker, recipient field, channel presets, share buttons.
- `src/pages/admin/CampaignLinksPage.tsx` — minor copy tweak; no structural change.
- `remotion/` — new project with two compositions (`diamond-vale-scroll`, `blog-scroll`) and one shared `ScrollPan` scene.
- `/mnt/documents/tavara-diamond-vale-tiktok.mp4`, `/mnt/documents/tavara-blog-know-someone-tiktok.mp4` — output artifacts.

## Out of scope (flag if you want them next)

- Auto-publishing to Facebook or TikTok from the admin tool.
- QR codes for the printed/handout case — easy add later.
- Real screen-recording of an interactive session (we can only pan a static capture in the sandbox; if you want a true cursor-and-click recording, that needs to be done from your laptop).