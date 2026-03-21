

## Enhance Anonymous Report for Nurse-Facing Care Assessment

### Problem

The current anonymous report strips ALL personal details and replaces them with just a User ID. Nurses evaluating whether to accept an assignment get almost no useful information. Meanwhile, the `care_needs_family` table has rich data (allergies, medical conditions, care location, emergency plan, specific assistance needs) that isn't fully surfaced even in the non-anonymous report.

### Ana Maria's Data Available But Not in Report

From `care_needs_family`:
- **Care location**: "199 Monica Drive, Block 4, Palmiste, San Fernando" → anonymous version should show "Palmiste, San Fernando"
- **Diagnosed conditions**: "High blood pressure"
- **Known allergies**: "Aspirin allergy"
- **Emergency plan**: "N/A"
- **Specific needs**: Feeding ✓, Medication ✓, Laundry ✓, Meal prep ✓, Memory reminders ✓, Tidy room ✓, Vitals check ✓
- **Communication method**: text
- **Check-in preference**: voice
- **Emergency contact relationship**: "Son of Carol Glenn-Aimey"

### Plan

**Modify: `src/services/admin/userReportGenerator.ts`**

#### 1. Add general location to anonymous report

In the anonymous Basic Information section (line 114-116), instead of just showing User ID, also show:
- **General Location**: Extract city/area from address (parse last 2 parts of comma-separated address, e.g. "Palmiste, San Fernando")
- **Care Schedule** (already shown)
- **Role** and **Registration Date** (already shown)

Add a helper function `extractGeneralLocation(address)` that takes "199 Monica Drive, Block 4, Palmiste, San Fernando" and returns "Palmiste, San Fernando".

#### 2. Expand Care Assessment section with all nurse-relevant fields

Currently the assessment section (lines 272-331) only includes:
- Assistance types (7 boolean fields)
- Preferred care hours
- Diagnosed conditions
- Additional notes
- Contact info (non-anonymous only)

**Add these missing fields from `care_needs_family`:**
- Known allergies
- Emergency plan
- Care location (general area only in anonymous mode)
- Communication method & check-in preference
- Specific care tasks: laundry_support, meal_prep, memory_reminders, tidy_room, vitals_check, fresh_air_walks, grocery_runs, escort_to_appointments, fall_monitoring, wandering_prevention, equipment_use, gentle_engagement, dementia_redirection
- Diagnosed conditions (already there)
- Coverage preferences: weekday_coverage, weekend_coverage, plan_type

#### 3. Add "Nurse-Facing Summary" section for anonymous reports

Add a new section at the top of anonymous reports titled **"Care Opportunity Summary"** with:
- General location (area only)
- Care recipient relationship (e.g. "parent") — no name
- Care types needed
- Schedule required
- Key medical info (conditions, allergies)
- Assistance categories needed
- Budget range

This gives nurses a quick snapshot without identifying the family.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/services/admin/userReportGenerator.ts` | Add general location extractor, expand care assessment fields, add nurse-facing summary for anonymous reports |

### Result

The anonymous PDF will show: "Palmiste, San Fernando" as location, full care assessment details (allergies, conditions, specific tasks), coverage schedule, and a nurse-facing summary — all without revealing the family name, exact address, or care recipient name.

