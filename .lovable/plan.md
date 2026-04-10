## Revamp Onboarding Checklist: Review-Based Discovery with Quick Links

### Problem

The current "Discovery & Needs Assessment" section assumes the admin is asking everything from scratch. In reality, families like Ana Marie have already completed registration, care assessment, and legacy story submissions. The checklist should help the admin **review** what the client already submitted, not re-ask.

### Approach

Update `ONBOARDING_SECTIONS` in `AdminOnboardingChecklistPage.tsx` to:

1. **Replace "Pre-Call Preparation" section** with a review-oriented version that accounts for family-created plans (not just admin-created). Remove the "create care plan" and "set up shifts" items. Add items like "Review family's existing care plan (if created)" and "Review registration data".
2. **Replace "Discovery & Needs Assessment" section** with a **"Review Client Submissions"** section that includes:
  - Quick-link buttons to the 3 submission pages (open in new tabs so admin can navigate back easily):
    - **Family Registration** → `/registration/family`
    - **Care Needs Assessment** → `/family/care-assessment?mode=edit`
    - **Legacy Story** → `/family/story`
  - Checklist items become review tasks:
    - "Review registration: care recipient name, relationship, care types, special needs"
    - "Review care assessment: ADLs, conditions, care location"
    - "Review legacy story: personality, hobbies, daily routine, joyful things"
    - "Discuss what prompted them to seek care"
    - "Confirm family's expectations and care goals"
    - "Note any updates to cultural, dietary, or language preferences"
    - "Confirm emergency contacts and physician information"
    - "Note any edits needed for follow-up"
3. **Update the section data type** to support an optional `links` array per section, rendered as clickable buttons above the checklist items.

### Technical Changes

**File**: `src/pages/admin/AdminOnboardingChecklistPage.tsx`

- Extend `OnboardingSection` interface to add optional `links: { label: string; url: string; icon: React.ReactNode }[]`
- Update Section 1 (pre_call) items to be review-oriented, removing admin-creation assumptions
- Replace Section 2 with "Review Client Submissions" containing quick-link buttons and review checklist items
- Render links as `<a href="..." target="_blank">` buttons styled with the existing Button component, placed above the checklist items inside each collapsible section
- Add `ExternalLink` icon import from lucide-react for the link buttons
- Add `Heart` icon for the new discovery/review section

No other files need to change -- the page is already routed and linked from the admin dashboard.



## Revamp Admin Onboarding Checklist -- Informed by Industry Best Practices

### Research Summary

Top home care providers (HangZone Care, Mariposa Care, Assurance Home Care) follow a 6-step client onboarding flow:

1. **Discovery Call** -- Listen, build rapport, understand the human story (not just data collection)

2. **Needs Assessment** -- Review care recipient's condition, ADLs, medications, personality, preferences

3. **Collaborative Care Plan** -- Translate needs into tasks, define goals, finalize schedule *together*

4. **Client-Caregiver Match** -- Filter by skills, personality, availability; optionally arrange a "meet and greet"

5. **First Day of Service** -- Caregiver reviews care plan beforehand; warm handoff with coordinator present

6. **First-Week Follow-Up** -- 24-48 hour check-in with both family and caregiver; course-correct quickly

### What's Wrong with the Current Checklist

1. **Pre-Call section assumes admin creates the care plan** -- Ana Marie already created hers independently. The checklist should handle both scenarios (family-created vs admin-created).

2. **Shifts listed as "8 AM - 4 PM" are hardcoded** -- They should reference the actual system shift options from `CreateCarePlanPage.tsx`: Weekday (8am-4pm, 8am-6pm, 6am-6pm, 6pm-8am, none) and Weekend (6am-6pm, 8am-4pm, no).

3. **Missing critical onboarding steps** from industry best practices: needs assessment conversation, care goals discussion, caregiver matching/meet-and-greet, first-day preparation, and follow-up plan.

4. **No "next steps" or post-call section** -- top providers emphasize the 24-48 hour follow-up and first-week check-in.

### Revised Section Structure

**Section 1: Pre-Call Preparation** (updated)

- Review family account status (registered, profile complete?)

- Review existing care plan (if family already created one) OR note: care plan to be created during/after call

- Note care recipient name, relationship, and primary conditions

- Have family's phone number / WhatsApp ready

- Review any notes from initial inquiry or chat registration data

- Prepare screen-share or walkthrough materials

**Section 2: Discovery & Needs Assessment** (NEW -- from industry best practices)

- Ask about their story -- what prompted them to seek care

- Understand care recipient's daily routine and personality

- Discuss primary care needs (ADLs, medication, mobility, companionship)

- Ask about special conditions (dementia, diabetes, etc.)

- Discuss family's expectations and care goals

- Note any cultural, dietary, or language preferences

- Emergency contacts and physician information

**Section 3: Platform Overview for Family** (mostly same)

- How to log in (email + password or magic link)

- Family dashboard layout and shortcuts

- Care Plans quick link on dashboard

- How to view their care plan details

- Care team members and assigned professionals

- How to access the medication dashboard

- How to access the meal planner

**Section 4: Care Plan Review & Setup** (updated -- collaborative, not admin-dictated)

- Review existing care plan details (if already created by family)

- Care plan types (Scheduled Care, On-Demand)

- Discuss and confirm weekday coverage: 8am-4pm / 8am-6pm / 6am-6pm / 6pm-8am / none

- Discuss and confirm weekend coverage: 6am-6pm / 8am-4pm / none

- Additional shifts if needed (evening/overnight options)

- How to view / edit care plan details

- Care team members tab -- who's assigned

- Daily care logs tab -- how family views completed logs

**Section 5: Medication Management** (same)

**Section 6: Meal Management** (same)

**Section 7: Daily Care Checklist (Caregiver SOP)** (same, with inline SOP)

**Section 8: Professional Dashboard Overview** (same)

**Section 9: Caregiver Matching & Introduction** (NEW)

- Discuss caregiver preferences (skills, personality, language)

- Explain matching process and timeline

- Offer trial day option vs immediate start

- Tentatively assign caregiver (confirm after call)

- Arrange meet-and-greet if applicable

**Section 10: Next Steps & Follow-Up** (NEW)

- Confirm care start date (or trial day date)

- Set up WhatsApp care group

- Schedule 24-48 hour post-first-visit check-in

- Share admin/coordinator direct contact info

- Confirm family knows how to reach support

- Send welcome summary via email/WhatsApp after call

**Section 11: Communication & Notifications** (existing, moved to end)

### Files Changed

| File | Change |

|------|--------|

| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Replace `ONBOARDING_SECTIONS` array with the revised 11-section structure above. Shift options in Section 4 aligned to actual system values from `CreateCarePlanPage.tsx`. |

No routing or other file changes needed -- the page already exists and is routed.

### Technical Details

- Only the `ONBOARDING_SECTIONS` constant changes inside the existing file

- Adds two new icons: `Heart` (for discovery/needs) and `Users` (for caregiver matching) from lucide-react

- All existing functionality (checkboxes, localStorage persistence, progress tracking, SOP inline display) remains unchanged

UI Result

When the admin expands "Review Client Submissions", they see:

- Three prominent buttons: "View Registration", "View Care Assessment", "View Legacy Story" (each opens in a new tab)
- Below: checklist items for what to review and discuss during the call
- Admin checks off items as they review each submission with the family on the phone