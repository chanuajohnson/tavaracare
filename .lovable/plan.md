

## Add Post-Screening & Matching Nudge Messages

### What You Need
Two new contextual WhatsApp nudge buttons in the UserNudgeTab:

1. **For Denise (professional)**: A "Screening Complete — Next Steps" nudge that tells her she passed screening, confirms her availability, and outlines next steps (joining a care team, phone/video call scheduling)
2. **For the family**: A "Caregiver Found — Next Steps" nudge that informs them a nurse/team has been identified, and next steps are a phone call or video conference to confirm start date

### Current State
- The Nudge tab already has a **Professional Progress Nudge** showing step-by-step pipeline status
- When all 8 steps are complete, it shows "All 8 professional steps complete" with no action button
- For families, the Smart Completion Nudge exists but nothing for the "we found you a match" scenario

### Plan: 2 New Nudge Message Builders in UserNudgeTab.tsx

#### 1. "Screening Complete" Nudge for Professionals (when all steps are done)

Replace the static green "All 8 professional steps complete" card (lines 707-718) with an actionable card:

- Title: "🎉 Screening Complete — Send Next Steps"
- Message template:
  ```
  Hi [Name]! 💙 Chan from Tavara Care.

  🎉 Congratulations! You've successfully completed your screening process!

  We'd like to move forward and place you with a family who needs your skills. Here's what happens next:

  ✅ Your screening is complete
  📋 We're matching you with a care team
  📞 We'll schedule a brief call to confirm your availability and start date

  Could you please confirm:
  1. Are you still available to start?
  2. Any schedule preferences or constraints?

  We're excited to have you on board!
  — Chan, Tavara Care 💙
  ```
- Button: "Send Screening Complete Nudge via WhatsApp"

#### 2. "Caregiver Found" Nudge for Families (new card after Smart Completion Nudge)

Add a new card in the family section — a "Matching Update" nudge:

- Title: "🏥 Caregiver Found — Send Update"
- Message template:
  ```
  Hi [Name]! 💙 Chan from Tavara Care.

  Great news! 🎉 We've identified a nurse and care team for your loved one's home care.

  Here's what happens next:
  📞 We'd like to schedule a brief phone call or video conference with you
  📋 We'll discuss the care team, confirm the care schedule, and agree on a start date
  💙 Your input is essential to making sure everything is a perfect fit

  Could you let us know:
  1. Your preferred time for a call this week?
  2. Would you prefer a phone call or video conference?

  We're so close to getting your family the support they need!
  — Chan, Tavara Care 💙
  ```
- Button: "Send Caregiver Found Update via WhatsApp"
- This card appears for family users regardless of profile completeness — it's a separate contextual action

### File Changed
- `src/components/admin/UserNudgeTab.tsx` only

### Technical Details
- Two new message builder functions: `buildScreeningCompleteNudge` and `buildCaregiverFoundNudge`
- Two new handler functions using the existing `getWhatsAppUrl`/`getTavaraWhatsAppUrl` + `logNudgeSent` pattern
- The screening complete card replaces the passive green checkmark card for professionals
- The caregiver found card is added as an always-available action card in the family section
- No database changes, no new files

