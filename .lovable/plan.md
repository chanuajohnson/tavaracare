

## Admin Onboarding Checklist Page for Family Onboarding Calls

### Purpose
Create a dedicated admin page at `/admin/onboarding-checklist` that serves as a structured reference during phone/video onboarding calls with new families (starting with Ana Marie). This is a static reference page with collapsible sections covering every platform feature the admin needs to walk the family through.

### Page Structure

The page will be a single-page checklist with collapsible sections using the existing `Collapsible` component. Each section has interactive checkboxes so the admin can track what was covered during the call. State is stored in localStorage so it persists across refreshes.

#### Sections:

1. **Pre-Call Preparation** - Admin tasks before the call
   - Confirm family account exists and is active
   - Create care plan on behalf of family (via Admin Family Care Plans page)
   - Set up shifts (weekday 8-4, weekend 8-4 if needed)
   - Assign caregiver to care plan
   - Note family's care recipient name and relationship

2. **Platform Overview for Family** - What to explain
   - How to log in and navigate the family dashboard
   - Care Plans quick link on dashboard
   - How the family sees their care plan details
   - Care team members and assigned professionals

3. **Care Plan Walkthrough** - Walk through the care plan
   - Care plan types (Scheduled Care)
   - Weekday and weekend shift coverage options
   - How to view/edit care plan details
   - Care team members tab
   - Daily care logs tab (family view)

4. **Medication Management** - The meds system
   - How family adds medications (name, dosage, frequency, schedule)
   - Medication schedule view (today's schedule)
   - How professionals administer and record medications
   - Conflict-aware administration (prevents double-dosing)
   - Reports and export features
   - Printable medication cards

5. **Meal Management** - Meal planning features
   - Meal planner (weekly meal scheduling)
   - Recipe library
   - Grocery list manager
   - Nutrition tracker

6. **Daily Care Checklist (Caregiver SOP)** - How professionals operate
   - Full checklist sections displayed inline (Start of Shift, Care Tasks, Emotional Support, Home Tasks, Monitoring, Communication, Documentation, End of Shift)
   - How the professional fills out the checklist each shift
   - One log per professional per care plan per day rule
   - How family sees the completed logs

7. **Professional Dashboard Overview** - What the caregiver sees
   - Care assignments and client details
   - Calendar view with daily logs
   - Medication dashboard for assigned care plans
   - Document management and training modules

8. **Communication & Notifications** - How everyone stays in touch
   - Care plan edit notifications (bidirectional)
   - Daily log visibility for family
   - WhatsApp care group updates

### Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | New page with collapsible checklist sections, interactive checkboxes, localStorage persistence |
| `src/App.tsx` | Add route `/admin/onboarding-checklist` |
| `src/pages/admin/AdminDashboard.tsx` | Add "Onboarding Checklist" quick action button |

### Technical Details
- Uses existing `Collapsible`, `Checkbox`, `Card`, `Badge` components
- Checkboxes track progress via `localStorage` keyed by family name
- Reset button to clear all checkboxes for next onboarding
- Prints the caregiver SOP checklist sections inline (imported from `checklistSections.ts`)
- Mobile-responsive layout for use during phone calls
- No database changes needed -- purely a frontend reference page

