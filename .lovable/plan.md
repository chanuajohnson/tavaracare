

## Fix: Update Family Step 6 Nudge Template to Match Actual Scheduling Options

### Problem
The step_6 nudge says "Schedule a one-time care session" and "Book a home site visit" — but the actual scheduling modal offers **Trial Day ($320 TTD for 8hrs)** and **Hire Immediately (from $40/hr)**, plus a free 30-minute virtual consultation.

### Fix
Update the `message_template` for the existing step_6 nudge template (id: `55a35235-906c-4306-ac5a-25ce48e987e6`) with the correct options:

**Updated message:**
> Hi [Name]! 🎉 Chan from Tavara Care.
>
> Great news — you've been matched with a professional caregiver! Your care team is taking shape.
>
> Your next step is to schedule care. Here are your options:
> 💰 Trial Day — $320 TTD for a full 8-hour day with your matched caregiver (credit applies if you subscribe!)
> ⭐ Hire Immediately — Ongoing care starting from $40/hr
> 📞 Not sure yet? Book a free 30-minute virtual consultation first
>
> 📅 Get started here: https://tavaracare.lovable.app/dashboard/family
>
> We're excited to get your family the support they deserve!
> - Chan, Tavara Care 💙

### Implementation
Single `UPDATE` on `nudge_templates` table — no code changes needed.

| Action | Target | Description |
|--------|--------|-------------|
| Update | `nudge_templates` row `55a35235...` | Fix step_6 message to reflect Trial Day / Hire Immediately options |

