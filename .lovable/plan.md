## Rewrite: lighter on law, honest about what households can afford

You're right. The current draft over-anchors on statutory double time, which is not realistic for most Tavara households. The rewrite below keeps your voice, keeps the length, and shifts the centre of gravity from "the law says" to "what families actually do".

### What changes

- **Law verbiage reduced ~20%.** Removed the dedicated "Trinidad and Tobago statutory standard" section. Statutory protections get acknowledged once, in a single paragraph, as context, not as the headline answer.
- **Compensation framing widened.** The new copy names time-and-a-half, double time, substitute day off, and rotation as legitimate arrangements households actually use. No single number is presented as the only correct answer.
- **Reality of household budgets named.** Adds the line that not every family has unlimited resources and that the goal is a fair, respectful, sustainable arrangement, not winning an argument.
- **Same voice, same structural rhythm, same length** (~9 min read). Section headings keep the From the family side / From the care professional side split. Founder note from Chanua and the 11-holiday quick reference at the bottom are preserved.
- **Guardrails honoured throughout.** "Care professional" (never caregiver), "loved one" (never patient), no em or en dashes, no banned AI words, no public-surface dollar amounts beyond the per-hour care rate band.

### Structure of the rewritten body

1. **Public holidays reveal whether a care arrangement is working** (your opener, lightly tightened)
2. **The questions a holiday forces** (who covers, does she want to work it, what rate, can the household afford it)
3. **The real conversation is operational, not legal** (one paragraph acknowledging T&T labour protections exist, then pivoting to planning)
4. **From the family side** (plan two weeks ahead, talk compensation early, build the fill-in rotation, small dignities, write the arrangement down once)
5. **From the care professional side** (ask early, understand the household's reality, professionalism still applies, keep your own records)
6. **A note on compensation** (single short section: time-and-a-half, double time, substitute day, rotation, all legitimate; the rule is agree before, not after)
7. **The 11 public holidays at a glance** (kept)
8. **The universal principle** (kept, one paragraph)
9. **Chanua's founder note** (kept)
10. **Internal links** (kept: family features, professional features, family registration)

### Files touched

- `supabase/migrations/<timestamp>_update_holiday_blog_body.sql` — `UPDATE blog_posts SET body = $body$...$body$ WHERE slug = 'caring-on-a-public-holiday-trinidad-tobago'`. Status stays `draft`, cover image, slug, title, CTA, FAQs all untouched.

No changes to schema, RLS, routing, sitemap, clusters, or any other file. After the migration runs you review at `/admin/blog/fad384e5-b4fd-43d4-979c-f4d15e4a73e3` and flip to published when the copy reads right.

Approve and I will write the migration with the full rewritten body.