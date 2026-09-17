# Make family progress one number, everywhere

## What's wrong today (verified)

For Test Chan (chanuajohnson7@gmail.com) the record shows: registration complete, care assessment complete, loved one's story complete, readiness check taken, three caregivers assigned, no care plan yet. Four different places report four different numbers for the same person:

| Where | Shows | Why |
|---|---|---|
| Admin family card | 33% · 5/12 steps | Reads a saved snapshot row written by a database routine that still only knows 12 steps |
| Admin "Journey" tab | 50% · 6 of 17 steps | Reads the live 17-step list |
| Family dashboard "Your Care Journey Progress" | 50% · 6 of 12 | Same 17-step list, counting only the 12 non-optional ones |
| Kerry-Anne's card | 25% · 4/12 | Same stale snapshot, last written 15 Sep |

So the 25% and 33% are not measurements of anything current — they are old snapshots. The dashboard's 50% is the accurate one today.

The other two complaints have separate causes:

- **"Complete your care assessment" still showing in the readiness card.** That card's buttons are fixed text per readiness stage. They never look at what the family has already done, so a family that finished the assessment and the story is still told to do them.
- **Care Environment showing 0% "when I already did the care readiness".** Two different things share the word readiness. The *Care Readiness Check* is the pacing questionnaire the family answers. The journey's *Care Readiness Assessment* is the home walkthrough a caregiver does in week one, and it only ticks once a care plan exists alongside an assigned caregiver. Test Chan has caregivers but no care plan, so 0% is technically right and completely confusing.
- **The Care Readiness Check is not in the journey at all.** It was added to the unlock modal only, so it appears nowhere in the 17 steps, in the stage cards, or in admin.

## The governing source

One list, in code, used by everyone: the family journey step definitions currently living inside the dashboard hook. Everything else becomes a reader of it — the saved snapshot row is refreshed *from* it, never used to override it.

## What to build

1. **Move the step list into one shared definition file** and have the family dashboard, the admin card, and the admin Journey tab all read it. No component keeps its own copy.

2. **Add the Care Readiness Check as a real journey step**, placed right after "Complete Your Profile" and before "Complete Initial Care Assessment" — the order families actually walk through after registration. It counts as complete when the family has answered the questions. This makes the journey 18 steps.

3. **Rename the week-one walkthrough** from "Care Readiness Assessment" to "Home Safety Walkthrough" so it stops colliding with the family's own readiness check, and reword its description to say plainly that a caregiver completes it during the first week of care.

4. **Retire the stale snapshot as a display source.** The admin card reads the same live calculation as everything else. The database routine that writes the snapshot gets updated to the current step list so anything still reading it (assistant nudges, analytics) agrees, and the old 12-step totals are recalculated for existing families.

5. **Make the readiness card's next-step buttons completion-aware.** Anything already finished drops off; if a family has done registration, readiness, assessment and story, the card points them at what's genuinely next (their care team) instead of repeating finished work.

6. **Fix two data-lookup bugs found while tracing this**: the admin per-user step check looks for medications and meal plans using the family's own id instead of their care plan ids (so those steps can never tick in admin), and the meeting/start-date checklist is read under two different keys in two places, so "Initial Family Meeting" and "Care Begins" can disagree between admin and the family view.

## Verification

For Test Chan, after the change, admin card, admin Journey tab and family dashboard must all show the same percentage and the same "next step", with the Care Readiness Check ticked and the Home Safety Walkthrough clearly pending. Kerry-Anne (assessment done, no story, no readiness) must show one consistent lower number in all three places.

## Technical notes

- New `src/data/familyJourneySteps.ts` holding the canonical step array (id, title, description, category, optional flag) plus the completion predicate inputs; `useSharedFamilyJourneyData` consumes it rather than declaring steps inline.
- `MiniJourneyProgress` switches from `useStoredJourneyProgress` to the shared family calculation for family users; `useStoredJourneyProgress` stays for other roles.
- Migration updates `calculate_and_update_journey_progress` family branch: 18 steps, readiness detected via `profiles.family_readiness_profile`/`client_stage`, care-coordination and care-environment steps included, then a one-off recalculation pass over existing family rows.
- `useUserSpecificProgress`: medications/meal_plans queried with `.in('care_plan_id', carePlanIds)`.
- Checklist reads standardised on the `user_id` + `user_type='family'` pair used by `userProgressCalculator.ts`, and `useSharedFamilyJourneyData` updated to match.
- `readinessStages[].nextSteps` filtered at render time in `FamilyReadinessQuickAccess` against live completion flags.
- Untouched: App.tsx, routing, FamilyRegistration.tsx fields, chat flow, readiness scoring rules (no averaging, dimensions stay independent).
