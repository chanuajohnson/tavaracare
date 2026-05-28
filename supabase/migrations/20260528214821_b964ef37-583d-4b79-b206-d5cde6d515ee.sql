-- Seed 4 new blog posts as drafts. Editor reviews in /admin/blog, then publishes.

INSERT INTO public.blog_posts (
  slug, title, description, body, category, reading_time,
  author_name, author_role, cover_image_url,
  cta_label, cta_href, faqs, status, published_at
) VALUES
(
  'live-in-vs-hourly-care-trinidad-tobago',
  'Live-in vs Hourly Care in Trinidad & Tobago: Which Actually Fits Your Family?',
  'Two ways to arrange care at home in T&T. Real hours, real rates, and the household questions that decide which one fits your family.',
  $body$
When a family in Trinidad starts asking the question "what kind of care do we actually need?", the conversation almost always lands in the same place. Live-in or hourly. People say the words like they mean the same thing. They do not.

This post walks through what each one actually looks like in a Caribbean household, what they cost on public rates, and the household questions that quietly decide which one is right for your family.

## The short answer

**Hourly care** is a caregiver who comes to the home for a set shift, usually 8 hours, and goes back to their own life when the shift ends. You arrange the days and times, you fill the rest from the family or a second caregiver.

**Live-in care** is a caregiver who stays in the home for an extended block, typically 5 or 6 days, sleeps over, and rotates with one or two other caregivers so there is always someone in the house.

Same role. Very different arrangement.

## What hourly looks like in a T&T household

Most families arrange hourly care in 8-hour shifts. The most common pattern we see is Monday to Friday, 8 AM to 4 PM, sometimes extended to 6 PM. Weekends are usually covered by family, or by a weekend shift from 8 AM to 4 PM on Saturday and Sunday.

This works well when:

- A family member is home in the evenings and overnight
- The loved one sleeps through the night without needing help
- The household has a regular routine and someone to cover the gaps

The public care rate sits in three tiers depending on what the loved one needs:

| Tier | Care rate | Typical fit |
|---|---|---|
| Standard | $40/hr | Companion care, mobility support, light personal care |
| Full Service | $45/hr | Personal care plus medication management, more complex daily routine |
| Premium | $50+/hr | Skilled clinical needs, dementia care, post-surgery recovery, complex conditions |

You can do the arithmetic for any schedule. 40 hours a week at the Standard rate is $1,600/week. At Full Service, $1,800. The rate is what you pay your caregiver. It does not include the Tavara coordination fee, which we walk through privately during onboarding.

## What live-in looks like in a T&T household

Live-in is not "one caregiver who never leaves". That arrangement is unsafe for the caregiver and unstable for the family. A real live-in care team is two or three caregivers rotating, so the primary caregiver is on site for a 5 or 6 day block, then off, and a fill-in caregiver covers the gap.

The caregiver sleeps in the home. They have a private room. They have a clear schedule of working hours and sleep hours, and they have time off the property during the week. The 8-hour shift expectation does not disappear because someone lives in. It just gets organised inside the rotation.

Public live-in care starts from **$2,400 per week**. That is the floor. The actual weekly figure depends on the loved one's needs, the size of the household, and the rotation. We walk through your household's specific math during onboarding, not on a public page.

This works well when:

- The loved one cannot be left alone overnight
- There is no family member at home overnight, or there is but they need their own sleep
- The household has space for a caregiver to actually sleep and rest
- Continuity matters more than flexibility

## The honest comparison

Here is what families do not always realise when they start the conversation.

**Hourly is more flexible. Live-in is more continuous.**

If your loved one's needs are predictable and contained to certain hours, hourly is almost always the right answer. You pay for the hours you need, you stop when the shift ends, and the family covers the rest. The rate is transparent, the schedule is yours to design, and you can scale up or down as needs change.

If your loved one cannot be alone, especially overnight, hourly stops working. You end up either paying for 24 hours of overlapping shifts, which is more expensive than live-in, or you ask a family member to do the overnight shift forever, which is how burnout starts.

> [!OBSERVATION]
> The families who switch from hourly to live-in almost always do it after a fall, a hospital discharge, or a night that did not go well. The pattern is so consistent we now mention it during the very first call.

**Live-in is more continuous. Hourly is easier to start.**

Live-in needs more setup. The home needs to be ready. The caregiver needs a real bed and a place to keep their things. The rotation needs to be designed. We handle all of that, but it takes a week or two to set up properly, and we will not rush it.

Hourly can start within days of a match. A caregiver shows up for an 8-hour shift, and that is it.

## The household questions that actually decide

When a family asks us "live-in or hourly?" we ask back:

1. **Can your loved one be alone overnight?** If no, you are in live-in territory unless a family member is doing the overnight shift.
2. **Is there a routine that fits inside daytime hours?** If yes, hourly works well. If the needs are spread across day and night, hourly gets expensive fast.
3. **Who is currently doing the unpaid coverage?** If it is one adult child, every night, that arrangement has a clock on it. Burnout is not a maybe.
4. **What does your home actually have space for?** A live-in caregiver needs a real private space. If you do not have that, live-in is not the right starting point.
5. **What changes are coming in the next 6 months?** A hospital stay, a surgery, a deterioration. The right answer for today might not be the right answer for next quarter.

There is no wrong starting point. Most of the families we work with start with hourly and move to live-in when things change. A few start with live-in straight from hospital discharge. The match works as long as the arrangement matches the household.

## What's not on this page

The public care rate is one part of the cost. The coordination fee, the home preparation work, and the household-specific math for a live-in rotation all get covered privately when you start onboarding. We do not put those figures on a public page because they depend on your household, and putting them in a table would mislead you.

If you want a private walkthrough of your specific numbers, the readiness quiz at the bottom of this post takes about three minutes and gives us enough to build the conversation around your actual situation.

## Related reading

- [Senior Care Costs in Trinidad & Tobago (2026 Guide)](/blog/senior-care-costs-trinidad-tobago-2026) — the full breakdown of public rates and what each tier includes
- [What Dementia Care Costs in Trinidad & Tobago](/blog/cost-of-dementia-care-trinidad-tobago) — when the answer is almost always Premium tier and why
- [Paying for Care Without Going Broke](/blog/paying-for-care-without-going-broke-trinidad) — the honest family-meeting conversation, when to start, when to wait

$body$,
  'Family Care Guides',
  '8 min read',
  'Chanua Johnson',
  'Tavara Care Coordinator & Founder',
  'https://tavara.care/blog-covers/live-in-vs-hourly-care-trinidad-tobago.jpg',
  'Take the readiness quiz',
  '/family-readiness-quiz',
  $faqs$[
    {"q": "Is live-in care cheaper than 24-hour hourly care?", "a": "Yes, almost always. Once you cross roughly 60 to 70 hours of paid coverage per week, live-in becomes the better arrangement on rate alone. It also gives the loved one continuity that rotating 8-hour shifts cannot match."},
    {"q": "Can one caregiver do live-in by themselves?", "a": "No. A safe live-in arrangement is built around a primary caregiver with one or two fill-in caregivers covering days off. Anything else burns the caregiver out and leaves the household exposed when she needs rest or time off."},
    {"q": "What if I only need someone for a few hours a week?", "a": "Hourly is the right answer. Standard tier at $40/hr starts at single shifts and scales up as needed. There is no minimum weekly commitment, only a minimum shift length."},
    {"q": "How quickly can hourly care start?", "a": "Once a family is matched, hourly care can usually start within a few days. Live-in needs a week or two of setup time to do the rotation, the home preparation, and the introductions properly."},
    {"q": "What does the live-in weekly figure cover?", "a": "The public floor of $2,400 per week covers the primary caregiver's care rate for the standard rotation. The full household figure, including the fill-in caregiver and any clinical premium, is built around your loved one's specific needs and we walk through it during onboarding."}
  ]$faqs$::jsonb,
  'draft',
  NULL
),
(
  'cost-of-dementia-care-trinidad-tobago',
  'What Dementia Care Costs in Trinidad & Tobago, and What You Are Actually Paying For',
  'Dementia care in T&T sits at the Premium tier of $50+/hr. Here is what that rate covers, why the price is higher, and the parts of dementia care nobody costs into the spreadsheet.',
  $body$
The hardest question a family asks us is not "what does dementia care cost?". The hardest question is the one underneath: "why does it cost more than regular care?"

This post answers both. Honestly, without softening the math, and without putting figures on a public page that should stay private.

## Why dementia care sits at the Premium tier

The public care rate for dementia care in Trinidad & Tobago is **$50+/hour**. That is the Premium tier on our pricing. It is higher than Standard ($40/hr) and Full Service ($45/hr) for reasons that have nothing to do with the caregiver doing more "tasks".

Dementia care is harder because the caregiver is responsible for things that are not visible on a checklist:

- Reading the loved one's mood and adapting in real time
- Managing behaviours that change without warning, including resistance, agitation, and confusion
- Keeping the home safe when the loved one cannot keep themselves safe
- Holding the family steady through a condition that gets worse, not better
- Doing all of it without taking it personally when the loved one does not recognise them on a given day

A caregiver who can do this well is rare. Premium rate is what it costs to keep that caregiver in your household.

## What you are actually paying for at $50+/hr

Tavara's Premium tier caregivers have:

- Documented dementia training, not just general elder care training
- Real working hours with previous dementia households, references we have spoken to ourselves
- The clinical judgement to escalate when something changes, and the calm to not escalate when it does not
- Comfort with the medication routines that almost every dementia plan includes
- Comfort working in a household where the family is also grieving

That is what the rate covers. It does not cover the coordination fee, the home preparation, or the night-shift premium for overnight coverage. Those are separate, and we walk through your specific household math during onboarding.

## The shape of dementia care over time

Dementia care is not one arrangement. It is a moving arrangement that changes as the condition progresses.

**Early stage.** A few hours a day, often companion-style. The loved one is still independent in most ways, but needs prompting, supervision on the stove, and someone to keep them oriented. Standard or Full Service tier can sometimes work here if behaviours are stable.

**Middle stage.** Personal care becomes part of the routine. Medication management is essential. Behaviours start showing up: sundowning, repetition, occasional resistance. This is where Premium tier becomes the right answer for almost every family we work with.

**Late stage.** Full-time supervision. Often live-in or close to it. The caregiver is doing personal care, mobility support, feeding assistance, and behaviour management, often through the night.

The right tier and the right number of hours change with the stage. We re-look at the arrangement every few months because it has to keep matching the household.

## The costs nobody puts on the spreadsheet

Families coming into dementia care for the first time underestimate three things.

**Night coverage.** Sundowning is real. So is the 2 AM wandering. Many families start with daytime hourly and end up needing overnight coverage within a few months. The hourly math for 24-hour coverage gets expensive fast, which is why live-in often becomes the better arrangement once behaviours intensify.

**Home preparation.** Locks on certain doors. Removing trip hazards. A clear path from the bedroom to the bathroom at night. Sometimes a bed rail or a chair alarm. None of this is dramatic, but it adds up, and trying to do it after a fall is a worse plan than doing it before. We handle the preparation work as part of onboarding, and the figures get covered privately because they depend on the specific home.

**Family rest.** This is the cost nobody costs. The reason dementia care exists is so the family can sleep. The reason families wait too long to arrange it is that paying someone to sleep in your house feels strange, until you have not slept in three months and your job is at risk. The cost of waiting is usually higher than the cost of starting.

> [!LEARNED]
> The dementia families who do best are the ones who arranged care before the crisis, not after. The ones who waited for a fall or a hospital admission are usually rebuilding the household from a much harder starting point.

## How to actually plan for the cost

If you are reading this because someone in your family is in early-stage dementia, the most useful thing you can do today is:

1. **Get a clear picture of your loved one's hours.** Where do they need support and where are they still independent? An honest week-long log helps more than memory.
2. **Decide who in the family can realistically cover what.** Be specific. "I can do Sunday afternoons" is more useful than "I will help out."
3. **Pick a starting tier and a starting schedule.** Most families start with 4 or 5 weekday shifts at Premium and adjust within the first month. We expect adjustments. We design for them.
4. **Talk to us before things get worse.** A planned start is half the cost of an emergency one. Not in money, in stress and instability.

## What's not on this page

We do not list home preparation figures, household monthly totals, or live-in rotation math on a public page. Those depend on the loved one, the home, and the family. We walk through them privately during onboarding because putting averages on a page would mislead you, and dementia care is the wrong place to be misled.

## Related reading

- [Senior Care Costs in Trinidad & Tobago (2026 Guide)](/blog/senior-care-costs-trinidad-tobago-2026) — the full tier breakdown
- [Live-in vs Hourly Care](/blog/live-in-vs-hourly-care-trinidad-tobago) — when dementia families usually need to switch
- [When Help Feels Like Pressure](/blog/when-help-feels-like-pressure) — the emotional reality of bringing care into the home
- [The Adult Child Trap](/blog/adult-child-trap-caring-for-parent-burnout) — what unpaid family coverage costs

$body$,
  'Family Care Guides',
  '9 min read',
  'Chanua Johnson',
  'Tavara Care Coordinator & Founder',
  'https://tavara.care/blog-covers/cost-of-dementia-care-trinidad-tobago.jpg',
  'Take the readiness quiz',
  '/family-readiness-quiz',
  $faqs$[
    {"q": "Why is dementia care more expensive than regular elder care?", "a": "Dementia care requires specific training, real experience with behaviours that other elder care does not include, and a level of judgement that is much harder to find. The Premium tier rate of $50+/hr is what it costs to keep a caregiver in the household who can actually do the work well."},
    {"q": "Can I start with Standard tier and move up?", "a": "Sometimes, in very early stage dementia where behaviours are still stable. Most families end up at Premium within the first six months because the condition itself moves there. Starting at Premium is usually less disruptive than changing tiers mid-arrangement."},
    {"q": "Do I need live-in for dementia care?", "a": "Not always at the start. Most families begin with hourly weekday shifts and add overnight coverage or move to live-in when sundowning and night-time wandering start. We re-look at the arrangement every few months."},
    {"q": "What does home preparation involve for dementia care?", "a": "Safety adjustments to the home: certain locks, removing trip hazards, sometimes a bed rail or a chair alarm, and a clear path for night-time movement. The specifics are walked through privately during onboarding because they depend on the home itself."},
    {"q": "When should we start arranging care?", "a": "Sooner than feels comfortable. Families who plan ahead spend less and stay calmer than families who wait for a fall or a hospital admission. The cost of starting early is almost always lower than the cost of starting in crisis."}
  ]$faqs$::jsonb,
  'draft',
  NULL
),
(
  'paying-for-care-without-going-broke-trinidad',
  'Paying for Care Without Going Broke: An Honest Letter to Trinidad & Tobago Families',
  'A founder letter on the real arithmetic of paying for care in T&T. The guilt, the family meeting, splitting between siblings, and when to start vs when to wait.',
  $body$
I want to write to you the way I would write to my own family, because most of the conversations I have with families about cost start in the same place. Quiet panic, dressed up as a practical question.

So let me say the quiet thing out loud first. **Care is expensive. Not arranging care is also expensive, just in a different currency.** You are not weighing zero against a number. You are weighing one number against another.

## The arithmetic nobody wants to do

Most families come to me already knowing the public care rate. They have read the cost guide. They know it is $40, $45, or $50 plus per hour, and that live-in starts from $2,400 per week. The number that is on the page is the number that is in their head.

The number that is not in their head is the one underneath. What is the family currently spending without naming it? An adult daughter cutting back to part-time work. A son who has not slept properly in eight months. A spouse losing their own health. A sibling who flies in twice a year because nobody else can.

When I sit with families and we actually write down what the current arrangement costs, in real money and in the quieter currency, it is almost never zero. It is almost always more than they thought.

> [!LEARNED]
> The most expensive arrangement is usually the one a family is already running quietly. They just have not put a number on it.

## The guilt is the loudest part

I have learned not to argue with the guilt. The guilt does not respond to math. It responds to permission.

So let me give you the permission, in case nobody in your family has said it out loud yet.

**Arranging care for your loved one is not abandoning them.** It is not giving up. It is not what people in your church group will say it is when they have not lived it. It is the practical answer to a practical situation, and you are allowed to make it without apologising.

The families who do best are the ones who get past the guilt and into the arithmetic. The families who suffer longest are the ones who let the guilt run the household budget.

## The family meeting

You will need to have a family meeting. I am sorry. There is no shortcut.

The meeting works best when it has three things on the agenda, in this order:

1. **What does the loved one need, in honest terms?** Not what we hope they need. What the doctor said, what the falls log says, what the medications list says.
2. **What is the family currently doing, and is it sustainable?** Name names. Name hours. Be specific. Vague answers protect the people who are doing too little and punish the people who are doing too much.
3. **What is the gap, and how do we fill it?** Money is one way. Time is another. Most families end up using both.

I have seen families where one sibling pays more because another sibling does more. I have seen families where everyone contributes equally regardless of income because that is what feels fair. I have seen families where one person carries it because nobody else will.

There is no right answer. There is only the answer your family can actually live with.

## Splitting the cost between siblings

If you are going to split the cost, do it in writing. Not because you do not trust each other. Because written arrangements survive arguments, holidays, and changes in everyone's circumstances.

A few patterns I see work:

- **Even split.** Each sibling pays an equal share. Clean, fair, predictable. Works best when incomes are similar.
- **Proportional split.** Each sibling pays a share that reflects what they earn. Works when there is a real income gap.
- **Time-for-money split.** The sibling who lives near the parent does the in-person work. The siblings who live abroad cover more of the financial cost. Works when geography is the bigger factor than income.

Whichever pattern you use, agree on a review date. Six months later, sit down again and look at whether it is still fair. Almost always, the arrangement that worked at month one has shifted by month nine.

## When to start vs when to wait

Families ask me this constantly. "Should we start now, or wait until things get worse?"

My honest answer: **starting early is almost always cheaper than starting late.** Not because the rate is different. The rate is the same. It is cheaper because:

- A planned start uses fewer hours per week than a crisis start
- The loved one settles into the relationship before behaviours intensify
- The family does not burn out and have to spend three months recovering
- Home preparation can be done calmly instead of in the week after a hospital discharge

The families who tell me "I wish we had started six months earlier" outnumber the families who tell me "I wish we had waited" by about ten to one.

## What I cannot tell you on this page

I cannot tell you what your specific household will cost. Not because I am hiding it. Because it depends on:

- Your loved one's current needs and how they are likely to change
- How many hours the family can realistically cover
- Whether the arrangement is hourly, live-in, or a mix
- Whether the home needs preparation work, and how much
- Whether you want overnight coverage, weekend coverage, or both

I cover those numbers privately with families during onboarding. Not in a sales meeting. In a conversation where we look at your loved one's situation and build the actual math together. That is the only honest way to give you a real figure.

If you want to have that conversation, the readiness quiz at the bottom of this post takes about three minutes and gives me enough to make the conversation specific to your family.

## The last thing

You are not the first family to sit at a kitchen table at 11 PM with a notebook, a calculator, and a cup of tea that has gone cold. You are not the first family to feel like the numbers do not work. Most of the families who eventually arrange care started exactly where you are.

The arithmetic looks impossible until you write it down. Once you write it down, it is usually a different problem than the one you thought you had.

Write it down. Then call us, or do not. But write it down first.

*With care,*
*Chanua*

## Related reading

- [Senior Care Costs in Trinidad & Tobago (2026 Guide)](/blog/senior-care-costs-trinidad-tobago-2026) — the public rates and what each tier covers
- [Live-in vs Hourly Care](/blog/live-in-vs-hourly-care-trinidad-tobago) — which arrangement actually fits
- [How to Talk to Your Family About Getting a Caregiver](/blog/how-to-talk-to-family-about-getting-caregiver) — for the family meeting
- [The Adult Child Trap](/blog/adult-child-trap-caring-for-parent-burnout) — what unpaid family coverage actually costs

$body$,
  'Emotional Realities of Care',
  '8 min read',
  'Chanua Johnson',
  'Tavara Care Coordinator & Founder',
  'https://tavara.care/blog-covers/paying-for-care-without-going-broke-trinidad.jpg',
  'Take the readiness quiz',
  '/family-readiness-quiz',
  $faqs$[
    {"q": "How do families in Trinidad usually split the cost of care between siblings?", "a": "Three patterns work: even split (everyone pays equally), proportional split (based on income), and time-for-money split (local sibling does the in-person work, abroad siblings cover more of the cost). Whichever you use, put it in writing and review every six months."},
    {"q": "Is it cheaper to wait until the situation is more urgent?", "a": "Almost always no. Planned starts use fewer hours per week, the loved one settles in before things get harder, and the home can be prepared calmly. Crisis starts cost more in money, stress, and instability."},
    {"q": "What if our family genuinely cannot afford the public rates?", "a": "We will have an honest conversation about it. Sometimes the answer is a smaller number of hours covering the highest-risk windows, sometimes it is restructuring how the family covers the gaps, sometimes it is starting with home preparation only. We do not run a one-size answer."},
    {"q": "How do I bring up cost in the family meeting?", "a": "Start with what is currently being done, not what it will cost. Once everyone sees the unpaid work that is already happening, the cost conversation becomes much more honest."},
    {"q": "Can we get the full cost figure before signing anything?", "a": "Yes, always. The readiness quiz or a single onboarding conversation gives us enough to build the specific number for your household. There are no figures hidden behind a contract."}
  ]$faqs$::jsonb,
  'draft',
  NULL
),
(
  'finding-a-caregiver-in-port-of-spain-or-san-fernando',
  'Finding a Caregiver in Port of Spain, San Fernando, Arima or Tobago: What is Different in Each Area',
  'Travel time, weekend coverage, who is available where, and what to ask when interviewing. The honest geographic differences when arranging care in T&T.',
  $body$
"How long will it take to find a caregiver near us?" is the most common question I get in the first call with a family. The answer changes depending on where "near us" actually is.

This post walks through what is different about arranging care in the four areas families ask about most: Port of Spain and the western corridor, San Fernando and the south, Arima and the east, and Tobago.

## Why area matters more than people think

Caregivers in Trinidad & Tobago do not live evenly across the country. They cluster, like everyone else, around where the population, the housing, and the transport actually is. That clustering affects:

- How quickly a family can be matched
- Who is available for weekend or overnight coverage
- How realistic certain shift patterns are
- What the caregiver's travel day looks like before and after the shift

We work across the whole country. The match still works wherever the family is. It just looks different in different places, and a family that knows the differences makes better choices in the first week.

## Port of Spain and the western corridor

This is the densest pool. Diego Martin, Westmoorings, St Ann's, Cascade, St James, Maraval, Woodbrook. Caregivers in this corridor often live close enough to take public transport or share a taxi, which means shift coverage is more flexible and short-notice fill-ins are more realistic.

What this means for the family:

- **Match times are typically the fastest.** A first match is usually possible within days, not weeks.
- **Weekend coverage is easier to arrange** because the pool is deep.
- **Overnight shifts are more available** for the same reason.
- **Live-in is well-supported** because many caregivers in this corridor already have experience with live-in households.

What to ask when interviewing:

- "How do you travel to work, and what is your backup if that falls through?" Reliable travel is the single biggest predictor of whether a caregiver shows up on time across a year.
- "Have you worked in a multi-generation household before?" Many Port of Spain homes have grandparents, adult children, and grandchildren under one roof. The dynamic matters.

[More on the western corridor on our Port of Spain care page.](/care/port-of-spain)

## San Fernando and the south

San Fernando, Marabella, Gasparillo, Princes Town, Penal, Debe. The southern pool is strong but more spread out than the west. Caregivers often travel further to a single household, which makes a few things different:

- **Match times can take a week or two longer** depending on the specific area within the south.
- **Long single shifts work better than split shifts.** A caregiver travelling 45 minutes each way will not accept a 4-hour midday shift twice a day. Plan for 8-hour blocks.
- **Live-in is often the better arrangement in the south** for families needing more than 30 hours a week, because the rotation removes the daily commute entirely.

What to ask when interviewing:

- "How long is your travel each way, and what are your traffic windows?" The Solomon Hochoy and the south-bound traffic shape everything.
- "Are you comfortable with the rotation schedule, including the off-days?" Live-in rotations only work if the caregiver actually rests on their off-days.

[More on the southern corridor on our San Fernando care page.](/care/san-fernando)

## Arima and the east

Arima, Tunapuna, Sangre Grande, Toco, Valencia. The eastern pool has grown a lot in the last two years. It is no longer the "hard area" it was reputed to be, but it is still less dense than the west.

What this means for the family:

- **Match times are middle of the pack.** Usually a week to ten days for a first match.
- **Weekend coverage is the area where Arima and points east still need more planning.** We often build the rotation around a primary caregiver from the east and a fill-in caregiver who is comfortable with the east-bound traffic on weekends.
- **Overnight is well-covered** because many eastern caregivers prefer the overnight shift for traffic reasons.

What to ask when interviewing:

- "Are you comfortable with the schedule including weekends?" Be specific. Do not assume.
- "Do you have a phone you check in the evenings for shift updates?" Communication discipline matters more in the east because of the distances involved.

[More on the eastern corridor on our Arima care page.](/care/arima)

## Tobago

Tobago is its own world. Scarborough, Crown Point, Plymouth, Roxborough. The caregiver pool is smaller, the community is tighter, and the dynamics of arranging care are different in important ways.

What this means for the family:

- **Match times are longer.** Plan for two to three weeks, sometimes more for specialised needs.
- **Word of mouth matters more.** Caregivers in Tobago know each other. References move quickly, in both directions.
- **Live-in is more common as a starting arrangement** because the household and the caregiver often already know each other in some way.
- **Specialised needs (dementia, post-surgery, complex clinical) are the area where we sometimes need to coordinate with caregivers travelling from Trinidad** for the right match. We plan around it.

What to ask when interviewing:

- "Have you worked with a household where the caregiver and the family are part of the same community?" The dynamics are different and worth surfacing early.
- "How would you handle a situation where you needed to escalate something to us?" Tobago families benefit from a clear escalation path because the coordination is doing more work.

[More on Tobago care on our Tobago page.](/care/tobago)

## What is the same everywhere

The public care rate is the same across the country. Standard $40/hr, Full Service $45/hr, Premium $50+/hr. Live-in starts from $2,400 per week. We do not charge a geography premium, and we do not let caregivers do it either.

The matching process is the same. The vetting is the same. The coordination is the same.

What changes is the timing, the rotation, and the specific things to ask in the first interview. The rest is the same arrangement, with a household in a different postcode.

## What's not on this page

Specific weekly figures for your household, including the coordination fee and home preparation costs, are covered privately during onboarding. Those depend on your situation more than they depend on your area.

## Related reading

- [How to Find a Trusted Caregiver in Trinidad & Tobago](/blog/how-to-find-trusted-caregiver-trinidad-tobago) — the broader matching and vetting walkthrough
- [Live-in vs Hourly Care](/blog/live-in-vs-hourly-care-trinidad-tobago) — which arrangement fits, area by area
- [Senior Care Costs in Trinidad & Tobago (2026 Guide)](/blog/senior-care-costs-trinidad-tobago-2026) — the full rate breakdown

$body$,
  'Family Care Guides',
  '8 min read',
  'Chanua Johnson',
  'Tavara Care Coordinator & Founder',
  'https://tavara.care/blog-covers/finding-a-caregiver-in-port-of-spain-or-san-fernando.jpg',
  'Take the readiness quiz',
  '/family-readiness-quiz',
  $faqs$[
    {"q": "How long does it take to find a caregiver in Trinidad?", "a": "It depends on the area. Port of Spain and the western corridor are typically the fastest, with matches in days. San Fernando and the east take a week or two. Tobago is usually two to three weeks, sometimes more for specialised needs."},
    {"q": "Is the care rate higher in certain areas?", "a": "No. The public care rate is the same across Trinidad and Tobago. Standard at $40/hr, Full Service at $45/hr, Premium at $50+/hr. Live-in starts from $2,400 per week regardless of area."},
    {"q": "Are caregivers in Tobago harder to find?", "a": "The pool is smaller and matching takes longer, but it works. For specialised needs we sometimes coordinate with caregivers travelling from Trinidad. We plan for the timeline up front."},
    {"q": "Can I request a caregiver from a specific neighbourhood?", "a": "You can request it and we will try, but the better question is usually about reliability and travel rather than postcode. A caregiver one neighbourhood over with a reliable commute is a better match than someone next door without a stable way to get to work."},
    {"q": "What if our area is not on the list?", "a": "We work across the country. The four areas in this post are the ones families ask about most, but Diamond Vale, Couva, Chaguanas, Sangre Grande, and other areas are all covered. The patterns above are useful guides for whichever area you are in."}
  ]$faqs$::jsonb,
  'draft',
  NULL
);
