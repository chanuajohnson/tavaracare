# Save the shift-minimum explanation as a reusable nudge template

Store the approved "easing in vs. minimum 8-hour shift" explanation so it can be picked from the nudge library for any family who asks to start small, instead of being rewritten each time.

## What gets saved

A single new template in the nudge library:

- Name: `Family Shift Minimum - Easing In`
- Audience: family
- Stage: manual (available on demand, not tied to a journey step)
- Channel: whatsapp
- Uses the `[Name]` placeholder so the family's first name fills in automatically

## Message text

Hi [Name]! 💙 Chan from Tavara Care.

On easing in, I completely understand, and you can absolutely start gently. There's one thing I want to be upfront about so there are no surprises.

Caregivers aren't engaged by the hour or for part of a day. The shortest engagement is an 8-hour shift. The usual patterns are:

- Monday to Friday, 8 AM to 4 PM
- Monday to Friday, 8 AM to 6 PM or 6 AM to 6 PM if you need longer cover
- Weekends only, Saturday and Sunday, 8 AM to 4 PM or 6 AM to 6 PM
- Evening or overnight shifts if nights are the harder part

So even if your loved one only needs someone beside them for a couple of hours at first, the caregiver's engagement is still built around a full shift. You're welcome to use that time however suits you: rest, errands, appointments, or simply having someone in the house while you get your own day back. Many families start exactly this way and grow into the full shift naturally.

The reason it works this way is simple and human. These are trained caregivers who need a livable, predictable income. When a household can only offer a few hours here and there, a caregiver has to keep looking for something steadier, and you end up with people coming and going. We'd rather place someone who stays and gets to know your loved one properly.

If a gentle start feels right, weekends only, or five days at 8 AM to 4 PM, are the two easiest places to begin. Tell me which feels closer and I'll set it up for you.

Any questions, just reply here 💙
— Chan, Tavara Care

## Notes

- No hourly or weekly dollar amounts appear in the message, so it stays safe to send to any family.
- Shift patterns match the options already offered in family registration.
- Nothing else changes: no new screens, no changes to how nudges are sent.

## Technical detail

One insert into `nudge_templates` with `name`, `stage = 'manual'`, `role = 'family'`, `message_type = 'whatsapp'`, `message_template` holding the text above. It will then appear in the admin nudge template list and the send-nudge picker like the existing family templates.
