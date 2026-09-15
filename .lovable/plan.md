# Simplify the "A good next step for you" options

On the readiness result screen for a family who is just starting, three buttons currently show: "Find a caregiver", "Tell us about your loved one", and "Chat with TAV first".

## Change

Leave one option only: **Tell us about your loved one**, as the primary button. Remove "Find a caregiver" and "Chat with TAV first".

Nothing else changes: the result wording, the "Did we get it right?" box, the dashboard/retake buttons, and the options shown to families further along all stay as they are.

## Technical detail

`src/data/familyReadinessQuiz.ts` — stage 1 `nextSteps` reduced to a single entry (`/family/story`, default primary variant). Stages 2 to 4 untouched.
