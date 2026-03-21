## Redesign ScheduleVisitModal: From Consultation to Action

### Current Problem

The modal offers a "30-min video call" (free) or "home assessment" ($300). These are consultations — not what families actually want. They want a **caregiver**, not a meeting.

### New Modal Design — 3 Options

The modal becomes **"Get Started with Care"** with three clear action paths:


| Option               | Description                                               | Price                      | What Happens                                                          |
| -------------------- | --------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------- |
| **Trial Day**        | Full-day caregiver trial (8 hrs) with a matched caregiver | $320 TTD ($40/hr)          | Family picks a preferred date, admin assigns a caregiver and confirms |
| **Hire Immediately** | Start ongoing care — pick a start date                    | From $40/hr (subscription) | Family selects start date, admin sets up recurring schedule           |
| &nbsp;               | &nbsp;                                                    | &nbsp;                     | &nbsp;                                                                |


### User Flow for Each

**Trial Day ($320 TTD)**

1. Select "Trial Day" → pick preferred start date from calendar
2. System saves request with `visit_type: 'trial_day'`, `payment_status: 'pending'`
3. Admin sees request, assigns an available caregiver, confirms date
4. After trial → existing `PostTrialConversionModal` kicks in (direct hire or subscribe)

**Hire Immediately**

1. Select "Hire Now" → pick desired start date
2. System saves with `visit_type: 'direct_hire'`, redirects to subscription/payment flow
3. Admin assigns caregiver and schedules recurring care

&nbsp;

### Implementation

#### Modify: `src/components/family/ScheduleVisitModal.tsx`

Complete rewrite of the modal content:

- **Title**: "Get Started with Care" instead of "Request Visit Scheduling"
- **3 radio options** instead of 2, with clear pricing and descriptions:
  - Trial Day card: calendar icon, "$320 TTD (Full Day)", "Try a matched caregiver for a full 8-hour day"
  - Hire Now card: briefcase icon, "From $45/hr", "Start ongoing care with your preferred caregiver"  
  - &nbsp;
- **Date picker**: Shows when Trial Day or Hire Now is selected — "Select your preferred start date"
- **Info box**: Changes contextually based on selection:
  - Trial: "Your $320 trial credit applies toward subscription if you convert"
  - Hire: "We'll match you with the best available caregiver for your needs"
  - &nbsp;
- **Submit**: Saves to `profiles` with the selected `visit_type` value (`trial_day`, `direct_hire`, )

#### DB update in `handleRequestScheduling`:

```
preferred_visit_type: selectedOption, // 'trial_day' | 'direct_hire' | 'virtual'
preferred_start_date: selectedDate (if trial/hire),
visit_scheduling_status: 'ready_to_schedule'
```

The existing `preferred_visit_type` column on `profiles` currently accepts `virtual` | `in_person`. We'll use the existing column but store the new values — no migration needed since it's a text field used for admin reference.

### Files Changed


| Action | File                                           | Description                                                                                              |
| ------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Modify | `src/components/family/ScheduleVisitModal.tsx` | Complete redesign: 3 options (trial day, hire now, virtual), date picker for trial/hire, contextual info |


### What Stays the Same

- Admin-side `ScheduleVisitDialog` and `AdminVisitScheduleManager` — unchanged, admin still confirms and assigns
- `PostTrialConversionModal` — already handles post-trial conversion at $320 credit
- Journey step progression — step 7 still triggers this modal
- All existing DB writes (`ready_for_admin_scheduling`, `visit_scheduling_status`) — same pattern, just new type values