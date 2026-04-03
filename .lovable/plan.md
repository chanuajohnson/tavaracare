

## Add Professional Progress-Aware Smart Nudge to Admin Nudge Tab

### Problem
The Nudge tab's "Smart Completion Nudge" feature only works for family users. For professionals, there's no auto-generated progress summary showing completed steps vs. next actions with a one-click WhatsApp send.

### Solution
Extend `UserNudgeTab.tsx` to support professional users by leveraging the `journeyProgress.steps` data (which already contains the 8-step professional pipeline with `completed`, `title`, `link`, and `stage` fields from `useSpecificUserProfessionalProgress`).

### Changes

**File: `src/components/admin/UserNudgeTab.tsx`**

1. **Add professional progress analysis function** (`getProfessionalProgressSummary`):
   - Takes `journeyProgress.steps` array
   - Returns `{ completedSteps, pendingSteps, nextStep }` where each includes title, stage, and link
   - Maps step titles to human-friendly action items (e.g., "Submit 2 professional references" becomes the pending action)

2. **Add professional nudge message builder** (`buildProfessionalNudgeMessage`):
   - Generates a WhatsApp message like:
     ```
     Hi [Name]! 💙 Chan from Tavara Care.

     Great progress on your caregiver journey! Here's where you stand:

     ✅ Account created
     ✅ Profile completed
     ✅ Availability set
     ✅ Documents uploaded

     📋 What's next:
     ❌ Submit 2 professional references
     ❌ Head nurse screening interview
     ❌ Match with families
     ❌ Complete training modules

     👉 Your next step: Submit 2 professional references
     🔗 https://tavara.care/professional/profile?tab=references

     Questions? Just reply here!
     — Chan, Tavara Care 💙
     ```

3. **Add professional Smart Nudge UI card** (similar to the family one):
   - Shows completed steps with checkmarks and pending steps with crosses
   - Groups by stage (Foundation, Qualification, Vetting, Active, Training)
   - One-click "Send Progress Nudge via WhatsApp" button
   - If all 8 steps complete, show green "All steps complete" card instead

4. **Update the rendering logic**:
   - Change the `{user.role === 'family' && (...)}` block (line 478) to also render the professional variant when `user.role === 'professional'`
   - The professional card uses the same `handleSendSmartNudge` pattern with logging

### Technical Details

| Area | Detail |
|------|--------|
| File modified | `src/components/admin/UserNudgeTab.tsx` only |
| Data source | `journeyProgress.steps` already passed from `UserDetailModal.tsx` via `useSpecificUserProfessionalProgress` |
| No new queries | Steps data (completed/pending, titles, links) is already available in the props |
| Links use | Production domain `tavara.care` per existing standard |

