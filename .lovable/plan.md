## 1. Where do the cover images appear?

The image you saw in chat is the **cover image** I generated and saved to `public/blog-covers/caring-on-a-public-holiday-trinidad-tobago.jpg`. It is stored in `blog_posts.cover_image_url`.

Today it is used in exactly two places:

- **Admin editor** (`/admin/blog/:id`) — preview field when editing the post.
- **Live blog post page** (`/blog/:slug`) — set as the **OG / social share image** (`<meta property="og:image">`) so it appears when the link is shared on Facebook, WhatsApp, LinkedIn, etc. It is the thumbnail in the screenshot you pasted of the Facebook share preview.

It is **not** rendered as a hero on the live post body, not in the admin blog list table, and not on `/blog` index cards. If you want it visible on any of those surfaces, that is a separate change, tell me which surface and I will add it.

## 2. Social caption guardrails violation

You are right. The Facebook caption used "the caregiver", which on family-facing public copy should be **"care professional"** per `mem://constraints/tavara-language-guardrails`. The caption generator system prompt currently allows "caregiver" as an acceptable replacement; that is too loose for outward social copy where families are the reader.

### Fix

Edit `supabase/functions/generate-social-caption/index.ts` system prompt:

1. In the language rules block, change the guidance from `caregiver` to **`care professional`** as the preferred public-surface noun for the person providing care. Keep `care team` for the group.
2. Add an explicit line: **"On family-facing social captions, always say 'care professional' (singular) or 'care team' (group). Never say 'caregiver', 'worker', 'staff', 'employee', or 'aide'."**
3. Add: **"Never say 'hire' or 'pay'. Use 'arrange care', 'coordinate care', or 'support'."**
4. Re-state the financial-privacy rule for captions: no subscription dollar amounts, no Home Preparation prices, no weekly/monthly totals. Per-hour care rates ($40/$45/$50+) and the $1,399 matching fee are allowed only when contextually relevant.
5. Bump an internal `PROMPT_VERSION` constant (comment) so we know captions generated after this change use the tightened rules.

### Regenerate the Facebook caption for this post

After deploying the function, re-run the Social Share generator for the Indian Arrival Day post on Facebook. The new caption will replace "caregiver" with "care professional". I will paste the rewritten caption back here for your approval before you post it.

### No schema, no UI, no route changes

This is a copy-rule fix inside one edge function plus a re-generation. No migration, no impact on `App.tsx`, navigation, registration flows, or the chat flow engine.

## Files touched

- `supabase/functions/generate-social-caption/index.ts` — system prompt tightened.

That is the whole change. Approve and I will apply it.