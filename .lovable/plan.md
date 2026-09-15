# Put the care assessment before the loved one's story

After the readiness check, the result screen currently sends a family straight to "Tell us about your loved one". That skips the care needs assessment, which is the step that actually unlocks caregiver matches. It should come first.

## What changes

On the "Here's where you are right now" screen (for families just starting):

1. Main button: **Complete your care assessment** -> the care needs assessment page
2. Second, quieter button: **Tell us about your loved one** -> the story page

So the order a family experiences is: registration -> readiness check -> care assessment -> loved one's story.

## What stays the same

- The readiness questions and how answers are stored.
- The Unlock Caregiver Matches panel, which already lists care assessment before the story.
- The family dashboard quick links, which already list the assessment before the story.
- The other three result stages (for families further along) keep their current suggestions.

## Technical note

Single edit to the stage 1 `nextSteps` array in `src/data/familyReadinessQuiz.ts`: primary entry `/family/care-assessment`, secondary `outline` entry `/family/story`. No other files touched.
