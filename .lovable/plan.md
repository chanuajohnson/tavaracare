
## Goal

Two things:
1. **Fix the existing TikTok video** — swap coral accent for Tavara navy, correct the free-tier copy, add the village tagline, change the ending.
2. **Build an admin Video Studio** at `/admin/video-studio` where you edit text per scene, generate copy with AI (grounded in FAQs + site content), preview live, and render an MP4 — repeatable for hundreds of posts.

---

## Part 1 — Fix the current Tavara Village video

**Brand palette (locked, from live site logo):**
- Background: `#F5F0E8` (warm cream — keep)
- Ink / primary: `#1E3A8A` deep navy (replaces black headings)
- Accent: same navy `#1E3A8A` for the `.care` (replaces the coral `#C44A2E`)
- Sub / muted: `#475569` slate

No orange anywhere. Logo wordmark and ".care" both navy, matching the site.

**Scene-by-scene rewrite (8s, 5 scenes, 9:16):**

1. **Scene 1 (0–1.5s)** — "Care, coordinated." (navy, kerned serif)
2. **Scene 2 (1.5–3s)** — "Not an agency. A village." (italic serif emphasis)
3. **Scene 3 (3–4.5s)** — Village motif (4 silhouettes converging into one ring) with caption "A care team built around your loved one."
4. **Scene 4 (4.5–6.5s)** — REWRITTEN free-tier-safe bullets, staggered in:
   - "A matched care team"
   - "A coordinator who knows your loved one"
   - "One plan. One village."
   (No daily logs. No phone number. No "shows up daily.")
5. **Scene 5 (6.5–8s)** — Logo lockup:
   - `tavara.care` (both halves navy)
   - "Care, coordinated."
   - NEW line below: *"It takes a village to care."* (italic serif, navy/60%)
   - Tiny footer: "All coordinated by your care coordinator. Tavara."

Re-render to `/mnt/documents/tavara-tiktok-village-v2.mp4` and emit a download artifact.

---

## Part 2 — Admin Video Studio (`/admin/video-studio`)

A no-code studio for you to crank out hundreds of branded TikToks by editing text + clicking Render.

### UX

```text
┌───────────────────────────────────────────────────────────┐
│ Video Studio                      [Save script] [Render]  │
├───────────────────┬───────────────────────────────────────┤
│ Templates         │  ┌─────────────────────────┐          │
│  • Village (8s)   │  │                         │          │
│  • Quick tip (10s)│  │   Live 9:16 preview     │          │
│  • Testimonial    │  │   (Remotion Player)     │          │
│  + New from AI    │  │                         │          │
│                   │  └─────────────────────────┘          │
│                   │  Scene 1  [text input]                │
│ Script title      │  Scene 2  [text input]                │
│ [_____________]   │  Scene 3  [text input + bullets]      │
│                   │  Scene 4  [text input]                │
│ Topic / angle     │  Scene 5  [text input + tagline]      │
│ [_____________]   │                                       │
│ [✨ Generate copy]│  Brand palette: locked (Tavara navy)  │
└───────────────────┴───────────────────────────────────────┘
```

### Features
- **Template picker** — start from "Village 8s" (the one we just fixed). More templates over time.
- **Scene text editor** — one field per scene; live Remotion Player updates as you type.
- **AI Generate** — type a topic ("respite care", "weekend coverage", "what coordinators do"), click Generate, and the system writes 5 short scene copy lines grounded in:
  - `src/data/faqs.ts`
  - curated brand snippets table (`video_brand_snippets`) — value props, taglines, do/don't language
  - the language guardrails (banned words → preferred replacements applied automatically)
- **Save script** — persists to `video_scripts` table (template_id, title, scenes JSON, created_by, status).
- **Render MP4** — calls an edge function that triggers our Remotion render with the script's text injected as props; uploads result to Supabase Storage; returns signed URL for download.
- **Library tab** — table of past scripts and rendered videos with download buttons. Re-render any script anytime.

### Guardrails on AI copy
- Language guardrail filter runs BEFORE returning copy: rejects/replaces "hire", "patient", "agency", "staff", "client", "worker", em-dashes, banned AI buzzwords.
- Hard cap: 6 words per headline, 4 words per bullet.
- Refuses to write specific dollar amounts on public copy (per financial-privacy memory).

---

## Technical Plan

### Database (Lovable Cloud migration)
```sql
create table video_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,        -- 'village-8s'
  name text not null,
  duration_seconds int not null,
  scene_schema jsonb not null,       -- field definitions per scene
  created_at timestamptz default now()
);

create table video_brand_snippets (
  id uuid primary key default gen_random_uuid(),
  category text not null,            -- 'value_prop' | 'tagline' | 'closing'
  text text not null,
  created_at timestamptz default now()
);

create table video_scripts (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references video_templates(id),
  title text not null,
  topic text,
  scenes jsonb not null,             -- { scene1: {...}, scene2: {...}, ... }
  rendered_url text,
  render_status text default 'draft', -- draft | rendering | ready | failed
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- admin-only RLS via has_role(auth.uid(), 'admin')
```

### Remotion changes
- Refactor `remotion/src/MainVideo.tsx` to accept `scenes` props (parametric video, Zod schema).
- Existing 5 scene components become text-driven from props.
- Brand tokens centralized in `remotion/src/brand.ts` (navy + cream + slate, NO orange).

### Edge functions
- `generate-video-script` — takes `{topic, templateId}`, pulls FAQs + brand snippets, calls Lovable AI Gateway (`google/gemini-3-flash-preview`), applies guardrail filter, returns scenes JSON.
- `render-tiktok-video` — takes `{scriptId}`, runs Remotion render server-side (via existing render script pattern), uploads MP4 to Supabase Storage bucket `marketing-videos`, updates `video_scripts.rendered_url`.

### Frontend
- New route `/admin/video-studio` (admin-only, gated by `has_role`).
- Components: `<TemplatePicker>`, `<SceneEditor>`, `<LivePreview>` (uses `@remotion/player`), `<AICopyButton>`, `<ScriptLibrary>`.
- Added to admin sidebar under "Marketing".

### Files to touch (no protected files)
- New: `src/pages/admin/VideoStudioPage.tsx` + components under `src/components/admin/video-studio/`
- New: `supabase/functions/generate-video-script/index.ts`
- New: `supabase/functions/render-tiktok-video/index.ts`
- New: `remotion/src/brand.ts`, parametric `MainVideo.tsx`
- Migration for the 3 tables + storage bucket
- Add route to `src/App.tsx` (single line, admin-only — protected file, will be additive only)

---

## Out of scope (for this loop)
- Auto-posting to TikTok (you download + post manually — same as Facebook flow)
- Voiceover / background music (templates are silent; you add audio in TikTok)
- Scheduled / queued bulk renders (one at a time for v1; bulk in v2)

## Suggested build order
1. Fix the video now (Part 1) → ship the new MP4 today.
2. Migration + brand.ts + parametric Remotion refactor.
3. Admin page + live preview (no AI yet).
4. AI copy generator + guardrail filter.
5. Server render + storage + download.

Shall I proceed with this plan?
