## Plan: Fix Match Count for Active Care Teams + Update Misleading Subscription CTA

### Problem 1: Only 1 Caregiver Match Shown Despite 6 Active Team Members, 

even if matches made manually by admin they exist

**Root cause**: Both `useUnifiedMatches.ts` (line 315-317) and `FamilyMatchNotification.tsx` (line 52) filter assignments by `available_for_matching !== false`. This field controls whether a caregiver appears in the **matching pool for new families** -- it should NOT exclude them from families they are **already assigned to**.

5 of the 6 caregivers assigned to this family have `available_for_matching = false` (likely because they are already fully committed), so only 1 shows up.

**Fix**: Remove the `available_for_matching` filter from both files when showing a family's **assigned** caregivers. These are active assignments, not discovery matches.

### Problem 2: "Unlock Premium Match Features" CTA is Misleading

The Foundation stage shows:

> "Get unlimited caregiver matches and advanced filtering for $7.99 one-time."

This is wrong -- Tavara's actual pricing is $199.99/week or $699.99/month for Family Care. The "$7.99 one-time" text is misleading and inconsistent with the subscription page it links to.

**Fix**: Replace the CTA text to say "Upgrade from Free" with a description that references the actual subscription tiers, and keep the redirect to `/subscription/features`.

### Changes


| File                                                     | Change                                                                                                                                                                            |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/useUnifiedMatches.ts`                         | Remove the `available_for_matching` filter (lines 315-318) so all active assignments show for the family                                                                          |
| `src/components/family/FamilyMatchNotification.tsx`      | Remove the `available_for_matching` filter (lines 51-52, 71, 74-75) so the notification shows all active team members                                                             |
| `src/components/family/EnhancedFamilyNextStepsPanel.tsx` | Update Foundation subscription CTA (lines 150-158): change title to "Upgrade Your Care Plan", description to reference actual weekly/monthly pricing, button text to "View Plans" |


### Result

- Family dashboard will correctly show all 6 assigned caregivers
- Match notification will say "You have 6 caregiver matches!" instead of 1
- Subscription CTA will accurately reflect pricing and not mislead families