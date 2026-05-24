insert into public.blog_posts (
  slug, title, description, body, category, reading_time,
  author_name, author_role, cta_label, cta_href, faqs, status, published_at
) values (
  'know-someone-who-needs-care-trinidad-tobago',
  'Know someone who could use Tavara? Start here.',
  'A short, share-friendly guide for families needing care at home and caregivers looking for steady work in Trinidad & Tobago. Two clear paths, no pressure.',
  $body$Everybody knows somebody.

An aunty whose memory is slipping. A neighbour recovering from a stroke. A family friend whose daughter lives in Canada and is trying to coordinate care for her mother over WhatsApp at 2am. A caregiver you know personally who is brilliant at the work but tired of the uncertainty of one-off jobs.

If any of that sounds familiar, this is the post to share.

## What Tavara actually does

Tavara is a care coordination platform built for Trinidad and Tobago. Families arrange care directly with vetted caregivers. We hold the schedule, run the daily care log, coordinate backup when life happens, and keep family in the diaspora in the loop from one dashboard.

We are not an agency. We are the layer that keeps care from falling apart at the seams.

---

## If your loved one needs care

If you are reading this because a parent, spouse, or grandparent needs more support at home than the family can hold alone, start with a short readiness check. It takes five minutes and helps you see what kind of care fits.

**[Take the family readiness quiz](/family-readiness-quiz?utm_source=blog&utm_medium=referral&utm_campaign=know-someone&utm_content=family-cta)**

No sign-up required to take it. Your answers help us match you with caregivers who fit the household, not just the schedule.

---

## If you do this work

If you are a trained caregiver, nurse, or home care assistant looking for steady work with families who actually appreciate continuity, Tavara is built for you. Profile, vetting, then matching with families in your area.

**[Sign up as a caregiver](/registration/professional?utm_source=blog&utm_medium=referral&utm_campaign=know-someone&utm_content=caregiver-cta)**

Takes about 30 seconds to start. The full vetting happens with our team.

---

## Why share this with someone

The hardest part of arranging care is admitting it is time. Most families wait until a fall, a hospital discharge, or a quiet collapse before they look. When a neighbour, a church friend, or a family member shares Tavara before the crisis, families have time to choose well instead of choosing fast.

If you live in a community like Diamond Vale, Petit Valley, San Fernando, Arima, Tobago, or anywhere across T&T, our [location pages](/care/diamond-vale) explain how care works in your area.

No obligation. No high-pressure sales call. Just a structured way to find the right caregiver and keep the arrangement running.
$body$,
  'Cultural & Community', '4 min read',
  'Chanua Johnson', 'Tavara Care Coordinator & Founder',
  'Take the family readiness quiz',
  '/family-readiness-quiz?utm_source=blog&utm_medium=referral&utm_campaign=know-someone&utm_content=post-cta',
  '[
    {"q": "Is it free to start?", "a": "Yes. Taking the family readiness quiz and creating a caregiver profile are both free. You only engage Tavara once a match moves forward."},
    {"q": "What does care actually cost?", "a": "Care rates are $40 per hour Standard, $45 per hour Full Service, $50 plus per hour Premium. Subscription details are shared privately during onboarding."},
    {"q": "What if the first match is not right?", "a": "We expect to fine tune. Tell us what is not working and we re-match without restarting from scratch. Continuity is what Tavara is built to protect."}
  ]'::jsonb,
  'published',
  '2026-05-24T09:00:00Z'
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  category = excluded.category,
  reading_time = excluded.reading_time,
  cta_label = excluded.cta_label,
  cta_href = excluded.cta_href,
  faqs = excluded.faqs,
  status = excluded.status,
  updated_at = now();