UPDATE public.blog_posts
SET
  body = REPLACE(
           REPLACE(
             body,
             '| Live-in care | Quoted weekly, varies by complexity |',
             '| Live-in care | **Starts from $2,400 / week**, quoted by complexity |'
           ),
           E'Live-in care isn''t billed hourly, it''s billed weekly, because the caregiver is on-site continuously and effectively becomes part of the household routine.\n\nLive-in rates depend on:',
           E'Live-in care isn''t billed hourly, it''s billed weekly, because the caregiver is on-site continuously and effectively becomes part of the household routine. As a floor, plan for **$2,400 / week** for a basic single-caregiver live-in arrangement; rotation, sleep cover, and complexity move it up from there.\n\nLive-in rates depend on:'
         ),
  updated_at = now()
WHERE slug = 'senior-care-costs-trinidad-tobago-2026';