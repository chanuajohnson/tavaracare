

## Plan: Add Post-Onboarding Family Nudge to UserNudgeTab

Add a new "Post-Onboarding Complete" nudge card for family users in `src/components/admin/UserNudgeTab.tsx`. This is a standard nudge the admin sends once a family's onboarding is finished, directing them to their dashboard and onboarding checklist.

### What It Does

A new card (green/teal themed) appears in the family section of the Nudge tab, after the "Caregiver Found" card. It contains a pre-built WhatsApp message that:

- Congratulates the family on completing onboarding
- Directs them to their dashboard quick links
- Points them to `/family/onboarding-checklist` to view post-onboarding notes
- Tells them to scroll to the Post-Onboarding Summary section
- Warm sign-off with "It takes a village to care" brand line

### Message Template

```
Hi [Name]! 💙 Chan from Tavara Care.

So happy we were able to successfully complete your onboarding! 🎉

Here's what to do next:

📱 Visit your dashboard: https://tavaracare.lovable.app/dashboard/family
Check your Quick Links for easy navigation to everything you need.

📋 View your onboarding progress: https://tavaracare.lovable.app/family/onboarding-checklist
Scroll down to the "Post-Onboarding Summary" section — you'll find all your care details, important dates, and helpful links there.

We're truly excited to be part of your care village. 💙
It takes a village to care.

Questions? Just reply here!
— Chan, Tavara Care 💙
```

### Changes

| File | Action |
|------|--------|
| `src/components/admin/UserNudgeTab.tsx` | Add `buildPostOnboardingFamilyNudge` function + handler + card UI after the Caregiver Found card (around line 782) |

### Technical Details

- New function `buildPostOnboardingFamilyNudge(userName: string): string` added alongside existing nudge builders (lines ~288-381)
- New handler `handleSendPostOnboardingNudge` following same pattern as `handleSendCaregiverFoundNudge`
- Card uses teal/green theme (`border-teal-500/50 bg-teal-50`) with `CheckCircle2` icon
- Logs to `admin_communications` via existing `logNudgeSent()` flow

