

## Two Issues to Address

### Issue 1: "Bev Vil" Profile Incomplete (why modal keeps appearing)
**Root cause confirmed:** User `33a739ce` (Bev Vil) has `professional_type = null` and `years_of_experience = null` in the database, even though documents are all uploaded. The readiness modal correctly shows because `isProfileComplete()` requires both fields.

This means the professional registration form either wasn't fully completed, or the save failed for these fields. The documents were uploaded separately and saved fine.

**Fix:** Two-part approach:
1. **Immediate data fix** — Update Bev Vil's profile with the correct `professional_type` and `years_of_experience` values (you'll need to tell me what type of professional Bev is and how many years of experience)
2. **Code fix** — Add validation to the professional registration form to prevent submission if `professional_type` or `years_of_experience` are empty, showing a toast error instead of silently saving incomplete data

### Issue 2: Caregiver Outreach Strategy
For finding caregivers to sign up to Tavara, we can build a **Caregiver Recruitment Landing Page** with a referral/outreach system:

1. **Create a dedicated `/join-as-caregiver` landing page** — A clean, compelling page explaining why caregivers should join Tavara, with benefits, testimonials, and a prominent "Sign Up" CTA that routes to `/registration/professional`
2. **Add UTM tracking** — The page captures UTM parameters (source, campaign) so you can track which outreach channels (WhatsApp, social media, flyers) drive the most signups
3. **Shareable link generator in Admin** — A simple tool in the admin dashboard that generates trackable links like `tavara.care/join-as-caregiver?utm_source=whatsapp&utm_campaign=march2026` for different outreach campaigns

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | `profiles` row `33a739ce` | Set `professional_type` and `years_of_experience` to correct values |
| Modify | `ProfessionalRegistration.tsx` | Add validation preventing save when professional_type or years_of_experience are empty |
| Create | `src/pages/JoinAsCaregiver.tsx` | Caregiver recruitment landing page |
| Modify | `src/App.tsx` | Add `/join-as-caregiver` route |
| Modify | Admin dashboard (optional) | Add shareable link generator for outreach campaigns |

