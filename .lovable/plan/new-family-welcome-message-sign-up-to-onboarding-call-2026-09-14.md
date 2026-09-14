# New Family Welcome Message (sign-up to onboarding call)

Goal: one WhatsApp-ready message a new family receives, with direct links for each step, plus the internal link you use to walk them through lifecycle cost.

## The four steps the family completes

1. Create the account and complete the family profile
   https://tavara.care/registration/family
2. Care Needs Assessment (routines, medical needs, schedule)
   https://tavara.care/family/care-assessment
3. Legacy Story (who your loved one is beyond the care tasks)
   https://tavara.care/family/story
4. Onboarding checklist and onboarding call
   https://tavara.care/family/onboarding-checklist

Steps 2 to 4 need them signed in, so the message states that clearly to avoid a dead-end link.

## Internal link for you only

Lifecycle cost walkthrough: https://tavara.care/admin/lifecycle-cost
Admin-only page. Use it on the onboarding call to talk through cost with the family. It is not a link to send them, and public messages keep to the per-hour care rates and the one-time matching and placement fee.

## Draft message

> Hi [Name] 💙
>
> Welcome to Tavara. Here is everything you need to get your loved one's care set up, in the order it happens.
>
> 1. Create your account and complete your family profile
> https://tavara.care/registration/family
>
> 2. Care Needs Assessment
> https://tavara.care/family/care-assessment
> This is where you tell us about routines, medications, mobility and the hours you need covered.
>
> 3. Legacy Story
> https://tavara.care/family/story
> Who your loved one is: their history, what they enjoy, what settles them. This is what helps us match the right caregiver, not just an available one.
>
> 4. Onboarding checklist and onboarding call
> https://tavara.care/family/onboarding-checklist
> Once your profile, assessment and story are in, we book a short call to go through the care plan, the schedule, the cost breakdown, and home readiness before day one.
>
> Steps 2 to 4 need you signed in, so start with the registration link and the rest will open right up.
>
> Take them in order and it moves quickly. Reply here at any point if something is unclear and I will walk you through it.

## Also proposed

Save this as a reusable template in the admin WhatsApp nudge library, named "New Family Welcome - Registration to Onboarding Call", role `family`, stage `manual`, using the `[Name]` placeholder so it auto-fills the recipient's first name.

## Technical detail

One database insert into `public.nudge_templates` (same shape as the existing "Live-in Care Enquiry" template). No UI or code changes needed; the template shows up automatically in the nudge tools.
