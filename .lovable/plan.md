

## Add Missing Nudge Templates and Fix Ana's Nudge Records

### Problem
1. **No "Professional Matched" nudge**: When a professional caregiver gets matched with a family, there's no template to notify them
2. **Family "Caregiver Unavailable" template too brief**: The existing one (`3037f155`) is generic — needs a more empathetic version that apologizes and directs the family to check revised matches or stay tuned for a reassignment
3. **Ana's nudge records have wrong message_type**: Both records in `admin_communications` show `message_type = 'custom'` instead of `whatsapp_nudge`, which may affect how the smart alert counts them

### Changes

#### 1. Insert new nudge templates (database)

**Professional Matched** (`professional`, stage: `matched`)
> Hi [Name]! 🎉 Chan from Tavara Care.
>
> Great news — you've been matched with a family who needs your care expertise! This is a real milestone in your Tavara journey.
>
> Please check your dashboard to review the family's care needs and confirm your availability. The sooner you respond, the sooner we can get things moving!
>
> 🔗 View your match: https://tavaracare.lovable.app/dashboard/professional
>
> Questions? Just reply here — I'm happy to help!
> - Chan, Tavara Care 💙

**Family Caregiver Unavailable - Apology** (`family`, stage: `caregiver_unavailable`)
> Hi [Name]! 💙 Chan from Tavara Care.
>
> We sincerely apologize — your matched caregiver has become temporarily unavailable due to personal circumstances. We understand this is disappointing and we're working quickly to resolve it.
>
> Here's what's happening next:
> ✅ We've already begun matching you with the next best available caregiver
> 📞 Our admin team will reach out within 24 hours with your updated match
>
> In the meantime, you can check your revised matches anytime:
> 🔗 https://tavaracare.lovable.app/family/matching
>
> Thank you for your patience — your family's care is our priority!
> - Chan, Tavara Care 💙

#### 2. Fix Ana's admin_communications records (database update)

Update the 2 existing records to `message_type = 'whatsapp_nudge'`:
- `262fde26-baa1-464f-bfa5-0eec1d9fbd95`
- `7b9c2ba0-09e1-47ec-864f-829a7f4153e9`

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Insert | `nudge_templates` (database) | 2 new templates: Professional Matched + Family Caregiver Unavailable Apology |
| Update | `admin_communications` (database) | Fix message_type on Ana's 2 records from `custom` to `whatsapp_nudge` |

