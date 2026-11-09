# Reel Studio for Tavara (admin-only)

Build the reel maker from your spec, adjusted to fit how Tavara already works.

## What you get
- A new admin page, **Reel Studio**, at `/admin/reels`, linked from the Admin Dashboard.
- Pick a family who has agreed to social posts. The list shows only the reference, area and type of care.
- A 15-second vertical video (1080x1920) in five parts: hook, map pin, care needs, weekly schedule, "Could this be you?" ending.
- A live preview with play, pause and scrub. Every line of text can be edited.
- A photo for each scene: upload one or reuse a saved one, with a slider to set the vertical focus. Stock or brand imagery only, never photos of the loved one.
- Downloads: the video (MP4 where the browser supports it, otherwise WebM with a note to convert it), three still images, and a copyable caption with hashtags.
- Tap, pop and chime sounds, generated in the browser and timed to each scene.
- Every export is logged: who made it, when, and the cleaned-up summary it used.

## Changes from the spec to fit Tavara
1. **Family data lives on profiles**, so there is no `families` table. Consent is added there as `family_consent_social` plus a consent timestamp, both off by default. Admins switch it on from the family's profile in the admin user panel. It is never on unless a family agrees.
2. **Ending link:** there is no `/match/...` page today. The closest existing public page is `/urgent-families`. Choose one of:
   - **A.** Link to `tavara.care/urgent-families` with no new page (fastest).
   - **B.** Add a new public `/match/:ref` page showing the same cleaned-up summary plus a "Sign up as a caregiver" button.
3. **Conditions:** your spec removes diagnoses. Current public family cards show general medical conditions. The reel follows your stricter rule and only shows care categories, for example "memory care" or "diabetes support", never the diagnosis wording.
4. **Wording:** your spec uses "patient", "client" and "apply". These fall under the language guardrails, so on-screen and caption copy uses "loved one", "family", "care team" and "learn more", and the guardrail scanner checks the caption.
5. **Rates:** none by default. With the optional "show rate band" switch, only the public per-hour care rate ($40/$45/$50+) can appear.
6. **Reference code:** a new non-guessable `reel_ref` per family, such as `TV-2611-08A`. It is not the support reference format.

## Privacy rules (enforced on the server)
- A server-side lookup only an admin can call returns the cleaned-up summary. It never returns names, ages, addresses, phone, email, diagnoses, medications, religion or payment details.
- The area is rounded to the nearest town. If fewer than 3 families are open in that town, it falls back to the wider region (for example "East Trinidad").
- Families without consent are never returned.

## Tests
- Privacy: no name, address, diagnosis or phone ever appears in the summary, and the region fallback applies below 3 families.
- Scene timing: the right scene shows at 0, 2.5, 5.5, 9.5, 12 and 15 seconds.
- Caption: no blanks or "undefined", 2,200 characters or less, no banned words.

## Not in this build (later stages)
Server-side MP4 conversion, round-up reels covering several families, and scheduled or automatic posting.

## Permission needed
Adding `/admin/reels` (and `/match/:ref` if you pick option B) means a small addition to the protected routing file. Existing routes stay untouched. Approving this plan counts as that permission.

## Technical details
- New files: `src/lib/reel/{spec,redact,engine,audio,export,assets,caption}.ts`, `src/lib/reel/scenes/*.ts`, `src/pages/admin/ReelStudioPage.tsx`, tests in `src/lib/reel/__tests__`.
- Migration: profile consent columns plus `reel_ref`; tables `reel_exports` and `reel_photo_library` with grants and admin-only RLS via `has_role`; `get_reel_safe_need(ref)` and `list_reel_candidates()` as SECURITY DEFINER with an admin check; public `reel-photos` storage bucket with admin-only writes.
- Rendering: a pure `drawFrame(ctx, t, spec, assets)` on canvas, `canvas.captureStream(30)` plus WebAudio into MediaRecorder at 8 Mbps.
