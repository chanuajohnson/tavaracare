

## Add Family Journey Nudge Templates

### Problem
The nudge system only has family templates for steps 1-4 and "stalled". There are no templates for families who have progressed further — like Ana Maria (42%, has care plan, needs legacy story + visit scheduling) or Sarina (25%, needs legacy story + care plan). Existing templates will not be modified.

### New Templates to Insert

All templates use `role: 'family'`, `message_type: 'whatsapp'` to match the proven professional template pattern with `[Name]` and `[X]%` auto-population.

| Template | Stage | For Users Like | Message Focus |
|----------|-------|----------------|---------------|
| Family Legacy Story | `step_5` | Ana Maria, Sarina | Encourage completing their loved one's legacy story — it helps caregivers provide personalized care |
| Family Matched - Schedule Care | `step_6` | Ana Maria | Congratulate on being matched, prompt to schedule a one-time care visit or book a site visit |
| Family Visit Scheduling | `step_7` | Any matched family | Prompt to schedule their home site visit with Tavara |
| Family Budget Update | `budget_update` | Ana Maria (has $20-25 rate) | Friendly note that rates have been updated, encourage reviewing new tiers in their profile |
| Family Re-engagement | `re_engagement` | Any inactive family | Warm check-in for families who haven't logged in recently |

### Template Messages

**Family Legacy Story (step_5)**:
> Hi [Name]! 💙 Chan from Tavara Care.
>
> You're [X]% through your care journey — great progress! One important step remaining is your loved one's Legacy Story.
>
> This helps your caregiver understand who your loved one truly is — their favorite meals, music, routines, and what brings them joy. It makes such a difference in the quality of care they receive.
>
> 📖 Complete it here: https://tavaracare.lovable.app/family/story
>
> It only takes a few minutes and your caregiver will thank you for it!
> - Chan, Tavara Care 💙

**Family Matched - Schedule Care (step_6)**:
> Hi [Name]! 🎉 Chan from Tavara Care.
>
> Great news — you've been matched with a professional caregiver! Your care team is taking shape.
>
> Your next step is to schedule a care visit so we can get started. You can:
> ✅ Schedule a one-time care session
> ✅ Book a home site visit with our team
>
> 📅 Visit your dashboard: https://tavaracare.lovable.app/dashboard/family
>
> We're excited to get your family the support they deserve!
> - Chan, Tavara Care 💙

**Family Visit Scheduling (step_7)**:
> Hi [Name]! 👋 Chan from Tavara Care.
>
> Just checking in — have you had a chance to schedule your home site visit yet? This is where our team visits your home to finalize the care plan and ensure everything is set up perfectly.
>
> 📅 Schedule here: https://tavaracare.lovable.app/family/visit-scheduling
>
> It's a quick and easy process. We're here to help every step of the way!
> - Chan, Tavara Care 💙

**Family Budget Update (budget_update)**:
> Hi [Name]! 💙 Chan from Tavara Care.
>
> We've updated our care rate options to better reflect the professional standards of certified caregivers in Trinidad & Tobago:
>
> 💰 $35/hr — Standard: Companionship, medication reminders, light meal prep
> ⭐ $40/hr — Full Service (Recommended): GAPP-certified care including meals, light cleaning, personal care
> 👑 $45+/hr — Premium: Specialized or complex medical care
>
> Please take a moment to update your budget preferences in your profile to ensure we match you with the right level of care.
>
> 🔗 Update here: https://tavaracare.lovable.app/dashboard/family
> - Chan, Tavara Care 💙

**Family Re-engagement (re_engagement)**:
> Hi [Name]! 👋 Chan from Tavara Care.
>
> We noticed it's been a little while since you visited Tavara. Your care journey is [X]% complete — you're so close!
>
> Our caregivers are ready and waiting to support your family. Let's pick up where you left off.
>
> 🔗 Continue here: https://tavaracare.lovable.app/dashboard/family
>
> Need help? Just reply to this message and we'll guide you through it!
> - Chan, Tavara Care 💙

### Implementation

**Single SQL insert** into `nudge_templates` table with 5 new rows. No code changes needed — the existing WhatsApp template manager and SendNudgeModal already support these templates with auto-populated variables.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Insert | `nudge_templates` (database) | 5 new family nudge templates for steps 5-7, budget update, and re-engagement |

