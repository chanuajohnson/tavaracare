# Two new blog posts

Add two posts to the Tavara blog, written in the founder voice per `docs/TAVARA_WRITING_STYLE.md` and the language guardrails (no em-dashes, no banned words, no "client/patient/staff/agency", say "loved one / care team / household / caregiver"). Both go into `src/content/blog/posts.ts` and are inserted into `blog_posts` via a Supabase migration so they appear on `/blog` immediately. AI baseline covers will be generated from `/admin/blog/...` once the posts exist.

---

## Post 1 — Meals: what the nurse actually cooks (and what she doesn't)

- **Slug:** `what-the-tavara-nurse-actually-cooks-trinidad`
- **Category:** `Family Care Guides`
- **Frame:** what the nurse actually cooks day to day. Comparison to JAPP is a sidebar, not the headline.
- **CTA:** Talk to a coordinator → `/family/features-overview`
- **Reading time:** ~7 min

### Sections
1. **Opening scene** — Arima household, nurse cooking daily because the adult daughter started eating the food too, resentment building. Real, not staged.
2. **The baseline: what's actually included** — light cooking of pre-prepared, already-seasoned (or lightly seasoned) meats. Batch cooking of peas, dried beans, pressure-cooked then frozen. Typically cooked every other day, not daily. Breakfast the way the household actually eats it (bread and peanut butter if that's what it is), because we capture this at onboarding.
3. **Who the food is for** — the loved one receiving care. Sometimes the spouse, when the nurse agrees and the dynamic makes sense (one spouse traditionally cooks for the other). Never for grandchildren, adult children living in the home, or extended family. Why this line exists: it's the difference between sustainable care and a nurse who quietly burns out in six weeks.
4. **What the nurse will not do** — clean a whole chicken from scratch (gut, cut, season, bag, parse, cook). The family supplies prepped proteins. Family or designated person handles meal sourcing if catered.
5. **Customary occasions** — holidays, birthdays, Mother's Day, national-food traditions. The nurse may choose to do something extra because a bond has formed. It is a gift, not an expectation.
6. **When you need more than the baseline** — doctor-recommended or nutritionist-recommended meals, specific dietary protocols. Two paths:
   - **Meal Support Upgrade** as a billable add-on through onboarding (referenced generally, no public dollar figures per the financial-privacy rule).
   - **Subscription tier upgrade** (Active Care / Premium names only, no public pricing) which unlocks matching to a nurse capable and willing to take on structured cooking.
7. **How JAPP fits** — short, respectful sidebar. JAPP covers the bare minimum and is a real resource for families who qualify. Tavara is what you reach for when you need someone who observes your household rhythm and cooks accordingly.
8. **Closing** — one paragraph on why we name this stuff out loud at onboarding. The Arima nurse and daughter didn't have a bad nurse or a bad daughter. They had an unspoken agreement that turned sour. We nip that.

### FAQs (4)
- "Can the nurse cook for my husband too?"
- "What if my mother is on a renal diet?"
- "We have a big family dinner on Sundays. Can the nurse help?"
- "Why every other day and not daily?"

---

## Post 2 — Caring for the one who's holding the fort

- **Slug:** `caring-for-the-family-member-holding-the-fort`
- **Category:** `Emotional Realities of Care`
- **Frame:** the unpaid primary coordinator (married son, single in-home daughter, long-distance sibling sending money) is the one most likely to collapse. Naming overwhelm, sleep loss, touch starvation, and the small outside-the-house routines that double as health monitoring (hairdresser reading the scalp, masseuse feeling the body, regular walks).
- **CTA:** Reach out to a coordinator → `/family/features-overview`
- **Reading time:** ~9 min
- **Sourcing:** background research task already running (caregiver burnout stats, touch starvation literature, sandwich-generation data, long-distance caregiving data). Draft will cite 2–4 named sources inline.

### Sections
1. **Opening** — the moment you finally say "I need help." Not the dramatic version. The quiet version, standing at the sink at 11pm.
2. **What's actually happening to your body** — sleep debt, cortisol, missed meals, shallow breathing, the headaches you stopped noticing. Concrete, not poetic.
3. **Touch starvation is real** — skin hunger in caregivers, why it shows up, why a hug from your own child doesn't always reach it. (Sourced.)
4. **The outside-the-house routines that double as monitoring** — hairdresser noticing scalp or hair changes (early indicator of stress, thyroid, anemia). Masseuse feeling lumps, skin texture, muscle guarding. A walking buddy noticing your gait, your breath, your mood. These are not luxuries. They are your second pair of eyes on your own body.
5. **Three real households** (this is the spine of the piece):
   - **The married son who's the point person.** Sandwich generation, often invisible because men are expected to handle it. What protects him: explicit lane separation with siblings, a partner who knows the load, one non-negotiable hour a week off the phone.
   - **The single daughter living in the home with brothers who aren't on location.** Default cook, default driver, default nurse, default everything. What protects her: written rotation even when one sibling is "in charge", money flow that recognises her labour, a coordinator who can say no on her behalf.
   - **The daughter with a special-needs child whose offshore sister sends money each month.** Two care loads in one household. Money is real help and it's not the same as showing up. What protects her: ring-fencing a portion of the monthly remittance for her own care (massage, hair, a sitter for two hours), and a coordinator who treats the offshore sister as a stakeholder with assigned operational lanes.
6. **The signal that you need to reach out** — concrete checklist (sleep under 5 hours three nights running, crying in the car, snapping at the loved one and not feeling bad about it, dropping medication doses, missing your own appointments). When two or more show up in a week, that's the call.
7. **What reaching out actually looks like at Tavara** — short, no sell. A coordinator, a conversation, a plan, a nurse if it's time.

### FAQs (4)
- "How do I know if I'm burnt out or just tired?"
- "My sibling sends money but won't come. How do I bring this up without a fight?"
- "Is it selfish to take a massage when my mother is sick?"
- "What do I say at work when I need to step away?"

---

## Technical implementation

### Files
- **edit `src/content/blog/posts.ts`** — add two new `BlogPost` consts (`mealsWhatNurseCooks`, `holdingTheFort`) and append to `blogPosts` array.
- **edit `public/sitemap.xml`** — add the two new `/blog/<slug>` URLs.
- **edit `public/llms.txt`** — add the two new post entries.
- **create migration `supabase/migrations/<ts>_seed_two_blog_posts.sql`** — `INSERT ... ON CONFLICT (slug) DO UPDATE` into `blog_posts` so the posts publish to the public blog feed without needing a separate seed run. Status `published`, `published_at` = today, author Chanua Johnson. No `cover_image_url` set — covers generated afterward via the admin AI baseline flow.

### Voice/lint pass before commit
- Search drafts for `—`, `–`, banned words from `src/lib/blog/api.ts` `BANNED_WORDS` and from `docs/TAVARA_WRITING_STYLE.md`. Zero hits required.
- Confirm British spellings (organise, neighbour, realise).
- Confirm both posts mention concrete T&T detail (place name, household scene, real currency or hour) at least once each.

### Out of scope
- Cover image generation (do after posts exist via the existing admin baseline flow).
- Any schema, RLS, routing, or component changes.
- Editing the existing 7 posts.
- Touching the `_PRESERVE_DO_NOT_EDIT_` files listed in project knowledge (registration, App.tsx, etc).

### Approval gate
Plan only. No files written until approved.
