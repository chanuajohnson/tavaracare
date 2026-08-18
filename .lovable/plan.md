Save the live-in care enquiry response as a reusable WhatsApp nudge template

## Goal
Create a reusable WhatsApp nudge template in the admin template library so Chan can quickly respond to family enquiries about 24/7 live-in care, pricing, and next steps.

## What will be built
A single seeded `nudge_templates` row that can be selected from `/admin/nudges` (WhatsApp Template Manager) and the `SendNudgeModal` / `TemplateSelector` used across the admin user views.

## Template content
- **Name:** Live-in Care Enquiry — Cost & Next Steps
- **Role:** family
- **Stage:** manual
- **Message type:** whatsapp
- **Message template:**

```text
Hi [Name]! 💙

Thank you for reaching out about care for your loved one. I wanted to give you a clear picture of how live-in care works with us.

A live-in caregiver stays in the home and provides consistent, around-the-clock support, with relief days built into the schedule so the care team stays fresh and your loved one is never left without coverage. Live-in arrangements start from $2,400 per week.

There is also a one-time matching and placement fee of $1,399, which covers vetting, matching, home readiness prep, and getting the care team set up properly.

If you prefer shift-based care instead, our care rates range from $40/hour for Standard support, $45/hour for Full Service, and $50+/hour for Premium care.

To move forward, the next steps are:
1. Complete your family profile at https://tavara.care/registration/family
2. Book a care assessment so we can understand your loved one's routines and needs
3. We will then match you with the right care team

Once your profile is complete, we can schedule a quick call to discuss the best arrangement for your family.

Let me know if you have any questions.
```

The `[Name]` placeholder is already supported by the existing `populateTemplate` logic in `SendNudgeModal` and `TemplateSelector`.

## Implementation
1. Create a migration that inserts the template row into `public.nudge_templates` if a template with the same name does not already exist.
2. No UI changes are required — the template will appear automatically in the existing admin template manager and send flows.

## Verification
- Query `public.nudge_templates` after migration to confirm the row exists.
- Open `/admin/nudges` and confirm the template appears under the Family / Manual section.
- Open a family user's nudge flow and confirm the template can be selected, personalized with `[Name]`, and opened in WhatsApp.
