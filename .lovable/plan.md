

## Plan: Session Persistence + WhatsApp Message with Deep Links

### Part 1: Keeping Users Logged In

The Supabase client is already configured with `persistSession: true` and `autoRefreshToken: true`, which means sessions are stored in localStorage and auto-refresh before expiry. Users should stay logged in across browser sessions.

However, there's a 15-second loading timeout in `useAuthSession.ts` that may be prematurely clearing auth state. The auth config also has `detectSessionInUrl: false`, which is correct for preventing token conflicts but means we need to ensure the session restore on page load is reliable.

**What we'll do:**
- Verify the auth session restore flow doesn't time out prematurely on slow connections (increase timeout or make it smarter)
- Ensure `autoRefreshToken` is working by checking that the refresh token cycle isn't broken by the `detectSessionInUrl: false` setting
- No major changes needed -- the current config already supports persistent sessions. If users are being logged out, the most likely cause is the 15-second timeout or browser clearing localStorage.

**Recommendation to user:** Users stay logged in as long as they don't clear browser data or use incognito mode. Supabase sessions last until the refresh token expires (typically 7 days of inactivity). This is already enabled in the current config. If specific users report being logged out, it's likely a browser/device setting.

### Part 2: WhatsApp Message with Clickable Deep Links for Denise

Create a ready-to-copy WhatsApp message that replaces the generic instructions ("Go to Quick Links...") with direct clickable URLs using the deep-link anchors we just implemented.

**The formatted message:**

```
Hi Denise 💙

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

— Chan
```

**Implementation:** Add this as a new nudge template in `UserNudgeTab.tsx` called "Post-Onboarding Ready to Commence" so admins can quickly generate and copy this message for any professional.

### Files to modify

| File | Change |
|------|--------|
| `src/components/admin/UserNudgeTab.tsx` | Add new "Ready to Commence" nudge template with deep links |

### No migration needed
This is a frontend-only addition -- a new WhatsApp nudge template.

