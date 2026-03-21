

## Improve Dashboard Clarity: Scheduling Status Banner + Quick Access Alignment

### Problem

The family dashboard doesn't clearly communicate to the user that they're in the **scheduling** stage. The notification banner says "You have 2 caregiver matches" but there's no prominent call-to-action guiding them to the next step: scheduling a trial day or hiring. The Quick Access bar doesn't reflect the current journey stage either.

### Changes

#### 1. Add Scheduling Status Banner — New component below match notification

**Create `src/components/family/SchedulingStatusBanner.tsx`**

A colored card (amber/orange gradient) that appears when:
- User has matches AND
- Journey stage is `scheduling` or later AND  
- Visit has NOT been scheduled yet (status is not `scheduled` or `completed`)

Content:
- Icon: Calendar
- Title: **"Next Step: Schedule Your Care"**
- Description: "You have matched caregivers ready. Choose a Trial Day ($320 TTD) or Hire Immediately ($40/hr) to get started."
- CTA Button: **"Get Started with Care →"** — opens the ScheduleVisitModal

When visit IS scheduled, show a green success banner instead:
- "Your care visit is scheduled for [date]. We'll confirm your caregiver shortly."

#### 2. Update Quick Access bar to show scheduling CTA

**Modify `src/components/family/FamilyShortcutMenuBar.tsx`**

Add a "Schedule Care" button (amber/orange, prominent) that appears when:
- Foundation is complete (matches exist)
- No visit scheduled yet

This replaces or sits alongside the "VIEW CAREGIVER MATCHES" button depending on stage.

#### 3. Wire the banner into FamilyDashboard

**Modify `src/components/family/FamilyDashboard.tsx`**

Insert `<SchedulingStatusBanner />` between the match notification and the journey progress panel. Pass `onScheduleClick` to open the ScheduleVisitModal.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Create | `src/components/family/SchedulingStatusBanner.tsx` | Amber banner showing scheduling next step with CTA, or green confirmation when scheduled |
| Modify | `src/components/family/FamilyShortcutMenuBar.tsx` | Add "Schedule Care" quick access button for scheduling stage |
| Modify | `src/components/family/FamilyDashboard.tsx` | Insert SchedulingStatusBanner between match notification and journey panel, wire modal open |

### Result

After matches appear, the family sees:
1. **Match notification** (blue): "You have 2 caregiver matches"
2. **Scheduling banner** (amber): "Next Step: Schedule Your Care — Trial Day or Hire Now" with a big CTA button
3. **Quick Access** includes a prominent "Schedule Care" button

This makes it unmistakably clear where they are and what to do next.

