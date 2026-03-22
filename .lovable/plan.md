

## Enhance Professional Nudge Templates

### Changes

#### 1. Update "New Family On Tavara" template (`ccde653a`)
Update the existing message to include family location context and match percentage urgency:

> Hi [Name]! 💙 Chan from Tavara Care.
>
> A new family in **[Location]** has just joined Tavara and is actively looking for care! Based on your profile, you could be a **[X]% match** — don't miss this opportunity.
>
> ✅ To ensure you're considered for this match:
> • Make sure your profile is fully completed
> • Upload your ID and Police Certificate of Character
> • Add your professional certifications
> • Confirm your availability and service area
>
> 💫 Families are matched with the most complete and responsive profiles first. Act quickly!
>
> 🔗 Update your profile: https://tavaracare.lovable.app/dashboard/professional
>
> Questions? Just reply here!
> - Chan, Tavara Care 💙

#### 2. Insert new "Profile & Availability Check" template
New template (role: `professional`, stage: `availability_check`):

> Hi [Name]! 👋 Chan from Tavara Care.
>
> We're doing a quick check-in with our care professionals to make sure our records are up to date.
>
> Could you please confirm:
> 📍 Your current location/service area — is it still accurate?
> ✅ Are you still available and open to new care assignments?
> 📅 Any changes to your schedule or availability?
>
> Keeping this updated helps us match you with the right families faster — and ensures you don't miss out on opportunities near you.
>
> 🔗 Update here: https://tavaracare.lovable.app/dashboard/professional
>
> Just reply to this message if anything has changed, or update your profile directly!
> - Chan, Tavara Care 💙

### Implementation
- **Update**: `nudge_templates` row `ccde653a` — replace `message_template` with location/match-aware version
- **Insert**: 1 new row into `nudge_templates` for "Profile & Availability Check"
- No code file changes needed — the Nudge tab already picks up templates by role/stage dynamically

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Update | `nudge_templates` (database) | Enhance "New Family On Tavara" with [Location] and [X]% placeholders |
| Insert | `nudge_templates` (database) | New "Profile & Availability Check" template for professionals |

