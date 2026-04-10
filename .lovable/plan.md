

## Plan: Update Rate Tier Definitions + Generate Caregiver Pre-Meeting Message

### Part 1: Generate Shareable Pre-Meeting Message

I will create a ready-to-send message (WhatsApp/text format) for the caregiver that includes:
- A warm greeting about tomorrow's onboarding session
- What will be covered (the 9 professional onboarding sections summarized)
- Navigation instructions: "Log in to your Tavara Care dashboard, look for the **Onboarding Progress** button in your Quick Access shortcuts, and click it to preview your checklist"
- The published URL path: `tavaracare.lovable.app/professional/onboarding-checklist`
- Encouraging tone aligned with Tavara brand voice

This will be output as a text file to `/mnt/documents/` for easy copy-paste.

### Part 2: Correct Rate Tier Definitions

The user wants the tiers restructured as follows:

| Tier | Rate | Includes |
|------|------|----------|
| **Standard** | $35/hr | Companionship, medication reminders, light meal prep, mobility assistance, light housekeeping, transportation accompaniment + GAPP-certified personal care (bathing, dressing, toileting), full meal preparation with basic daily dietary compliance, medication administration and logging, vital signs monitoring, detailed daily care documentation, specialized care (dementia/Alzheimer's, post-surgical, palliative) |
| **Full Service** | $40/hr | Everything in Standard + advanced specialist-directed meal prep with holidays and special occasions, complex medical needs (wound care, catheter care, oxygen management), overnight/live-in shifts, advanced certifications required (RN, LPN), behavioral health support |
| **Premium** | $45+/hr | Everything in Full Service + change-in-care-plan management, disease progression support (escalating needs beyond Full Service scope), multi-specialist coordination, 24/7 on-call availability, advanced palliative/end-of-life care, family training and transition planning |

**Files to update:**

| File | Change |
|------|--------|
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | Update `rates_payment` items with corrected tier descriptions and communication section to emphasize dashboard hub |
| `src/components/admin/onboarding/onboardingSections.ts` | Update `rates_and_changes` items with corrected tier descriptions (family-facing) |
| `src/components/admin/UserNudgeTab.tsx` | Update the nudge template rate text to match new tier definitions |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add rate tier reference card (like the SOP card) for `rates_payment` and `rates_and_changes` sections; add SOP reference for `daily_checklist_sop` |
| `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` | Add rate tier and SOP reference cards inline |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Add rate tier reference card inline |

### Part 3: Update Communication Section

Update `communication_support` items in `professionalOnboardingSections.ts` to lead with the Tavara Care Dashboard as the central hub, positioning WhatsApp as a secondary flow.

No database changes required.

