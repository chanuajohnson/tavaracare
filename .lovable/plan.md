

## Update Budget Rate Options Across the Platform

### Problem
Current budget options include unrealistically low rates ($15-$30/hour) that no caregiver would accept. A family just registered at $20-25/hour which is not viable. Need to replace all options with three tiers starting at $35/hour.

### New Budget Tiers

| Tier | Value | Label | Description |
|------|-------|-------|-------------|
| Standard | `35_hour` | $35/hour | Basic companionship, medication reminders, light meal prep |
| Full Service | `40_hour` | $40/hour — Recommended | Full GAPP-certified care: meals, light cleaning, personal care, medication management |
| Premium | `45_plus` | $45+/hour | Premium specialized care: complex medical needs, overnight, advanced certifications |

### Files to Update

#### 1. `src/pages/registration/FamilyRegistration.tsx` (lines 1155-1161)
Replace the 6 old `SelectItem` options with the 3 new tiers. Add a brief helper description below each option or under the select explaining what each tier includes.

#### 2. `src/data/chatRegistrationFlows.ts` (lines 264-270)
Replace the family chat registration budget options with the same 3 tiers.

#### 3. `src/data/chatRegistrationFlows.ts` (lines 486-491)
Update the professional "expected rate" options to match: `$35/hour`, `$40/hour`, `$45+/hour`, `Negotiable`.

#### 4. `src/components/professional/DashboardFamilyMatches.tsx` (lines 226-229)
Update the budget filter slider: change `min={15}` to `min={35}` and `max={50}` to `max={60}`, update default state from `[15, 50]` to `[35, 60]`.

#### 5. `src/services/chat/utils/inputValidation.ts` (line 116)
Update the budget validation error message to reflect the new range (e.g., "$35-45+/hour").

#### 6. `src/components/chatbot/ChatInputForm.tsx` (line 56)
Update placeholder text from "$20-30/hour" to "$35-45/hour".

### No database migration needed
The `budget_preferences` column is a text string — existing records keep their old values. New registrations will use the new values. Display logic throughout the app already handles arbitrary budget strings.

