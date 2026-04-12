

## Plan: Add "Ready to Commence" Nudge Template

### What's being done
Adding a new WhatsApp nudge template specifically for the "Ready to Commence" scenario -- when a professional has completed onboarding and needs to review notes, post-onboarding summary, and check the Readiness Approval before service commencement.

### Key difference from existing template
The existing `buildPostOnboardingProfessionalNudge` is a generic post-onboarding template. This new "Ready to Commence" template is specifically for the final stage before service starts -- it includes language about reviewing action items from a visit, checking the Readiness Approval as a digital confirmation, and awaiting final client confirmation before commencing.

### Changes to `src/components/admin/UserNudgeTab.tsx`

**1. Add new builder function** (after `buildPostOnboardingProfessionalNudge`, ~line 369):
```typescript
const buildReadyToCommenceNudge = (userName: string): string => {
  const firstName = userName?.split(' ')[0] || 'there';
  return `Hi ${firstName} 💙

Yes, the details you asked about are already documented — you can find everything in your dashboard.

👉 View your notes & action items here:
https://tavaracare.lovable.app/professional/onboarding-checklist#notes
You'll see the notes and action items listed there from yesterday's visit.

👉 Review your Post-Onboarding Summary:
https://tavaracare.lovable.app/professional/onboarding-checklist#post_onboarding
I have also listed for the Family the First Aid and items that the home should be stocked with over time — you can review that as well.

✅ Check the Readiness Approval checkbox once everything looks good:
https://tavaracare.lovable.app/professional/onboarding-checklist#post_onboarding
This acts as your digital confirmation that you've reviewed everything and are ready to commence as planned.

📱 Your full dashboard:
https://tavaracare.lovable.app/dashboard/professional

Once that's done, and once we receive final confirmation from the client regarding the podiatry service, I'll complete the information transfer and we'll prepare for a smooth start tomorrow. 💙

— Chan, Tavara Care`;
};
```

**2. Add handler function** (after `handleSendPostOnboardingProfessionalNudge`, ~line 643):
```typescript
const handleSendReadyToCommenceNudge = () => {
  const message = buildReadyToCommenceNudge(user.full_name);
  const url = user.phone_number
    ? getWhatsAppUrl(user.phone_number, message)
    : getTavaraWhatsAppUrl(message);
  window.open(url, '_blank');
  logNudgeSent();
  toast.success('Ready to Commence nudge sent & logged');
};
```

**3. Add UI card** in the professional section (after the Post-Onboarding card, ~line 1014):
- Indigo-themed card with a rocket/star icon
- Title: "🚀 Ready to Commence — Final Review"
- Description: "Send the professional direct links to review notes, post-onboarding summary, and check the Readiness Approval before service starts."
- Button: "Send Ready to Commence via WhatsApp"

### No auth changes
Per your instruction, no auth-related code will be touched.

### No migration needed
Frontend-only addition.

