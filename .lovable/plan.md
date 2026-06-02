
## Problem 1: AI Draft fails with "Failed to send a request to the Edge Function"

Console shows the real cause:
> Request header field `x-app-version` is not allowed by Access-Control-Allow-Headers in preflight response

The `blog-ai-draft` edge function only allows `authorization, x-client-info, apikey, content-type` in its CORS preflight, but the Supabase JS client now sends additional headers (`x-app-version`, `x-supabase-client-platform`, etc.). Browser blocks the request before it ever reaches the function.

**Fix:** widen `Access-Control-Allow-Headers` in `supabase/functions/blog-ai-draft/index.ts` to include the headers the modern Supabase client sends:
```
authorization, x-client-info, apikey, content-type,
x-app-version, x-supabase-client-platform, x-supabase-client-platform-version,
x-supabase-client-runtime, x-supabase-client-runtime-version
```

No other logic change. This is a one-line CORS fix and unblocks generation.

## Problem 2: CTA label + CTA href should be preset dropdowns

Right now both are free-text inputs, which is error-prone (typos, broken links, inconsistent voice). Convert to a single **CTA preset** dropdown that fills both label and href together, with an "Other (custom)" option that reveals the two text inputs for edge cases.

Preset list (drawn from existing CTAs across the site, all on-brand and routes that exist):

| Preset | Label | Href |
|---|---|---|
| Urgent care | Find Care Now | /urgent-families |
| Family registration | Start Your Family Profile | /registration/family |
| Caregiver registration | Join as a Caregiver | /registration/professional |
| Family readiness quiz | Take the Readiness Quiz | /family/readiness-quiz |
| Care plans | Explore Care Plans | /family/care-management |
| Live-in care | Learn About Live-In Care | /services/live-in-care |
| Dementia care | Dementia Care Support | /services/dementia-care |
| Post-surgery care | Post-Surgery Care | /services/post-surgery-care |
| Elder care | Elder Care Services | /services/elder-care |
| Pricing | See Care Rates | /family/care-management |
| WhatsApp Tavara | Message Tavara on WhatsApp | https://wa.me/18687865357 |
| Other (custom) | (free text) | (free text) |

Default selection: **Urgent care** (current behavior preserved).

## Files to change

1. `supabase/functions/blog-ai-draft/index.ts` — expand `corsHeaders.Access-Control-Allow-Headers`. No other changes.
2. `src/components/admin/blog/AiDraftBlogDialog.tsx` — replace the two CTA `<Input>` fields with a `<Select>` of presets; show inline custom inputs only when "Other" is selected. The values still flow into the existing `ctaLabel` and `ctaHref` state, so the request body to the edge function and `saveDraft()` are unchanged.

No DB migration, no changes to `AdminBlogPage.tsx`, the editor, posts.ts, sitemap.xml, or llms.txt.

## Out of scope (deferred until you ask)

- Adding an AI Draft panel directly on `/admin/blog/new` (your earlier "From /admin/blog/new directly" question was interrupted before you picked an option — happy to do that next, just confirm).
- Making category itself dynamic / admin-managed. Categories still come from `BLOG_CATEGORIES` in `src/lib/blog/api.ts`.
