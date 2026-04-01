

## Plan: Update Screening Copy + Seed Default Templates

### Changes Overview

Three things to do:
1. Update two description strings to say "professional caregivers" instead of "head nurse"
2. Seed 4 pre-built screening question templates in the database via the insert tool

---

### 1. Text Updates (2 files, 2 lines each)

**`src/components/admin/ScreeningSessionManager.tsx`** (line 215):
- Change: `"Send voice questionnaires to the head nurse for candidate evaluation"` → `"Send voice questionnaires to select professional caregivers for candidate evaluation"`

**`src/components/admin/ScreeningTemplateBuilder.tsx`** (line ~143):
- Change: `"Reusable question sets for head nurse screening calls"` → `"Reusable question sets for professional caregiver screening calls"`

### 2. Seed 4 Screening Templates (database insert)

Insert these 4 templates into `screening_question_templates`:

**Template 1: "Opening / Rapport"** (General category, 2 questions)
1. "Tell me a little about yourself and what drew you to caregiving."
2. "What types of clients have you worked with most — elderly, post-surgical, dementia, pediatric?"

**Template 2: "Clinical Competency"** (Clinical Competency category, 3 questions)
3. "Walk me through how you'd handle a client who refuses their medication."
4. "Have you managed wound care, catheter care, or feeding tubes? Which are you most comfortable with?"
5. "How do you handle a medical emergency — say a client falls or shows signs of a stroke?"

**Template 3: "Team / Rotation Fit"** (Team & Rotation Fit category, 3 questions)
6. "At Tavara, we rotate caregivers in a household so clients aren't dependent on one person. How do you feel about sharing a client with other nurses?"
7. "How do you handle handoff — what information do you pass to the next caregiver coming on shift?"
8. "Have you ever worked in a team-based care setting before? What worked well and what didn't?"

**Template 4: "Reliability, Culture & Red-Flag Checks"** (mixed categories, 8 questions)
9. "What does your ideal schedule look like — days, evenings, weekends, overnights?" (Reliability & Professionalism)
10. "How do you handle last-minute shift requests or schedule changes?" (Reliability & Professionalism)
11. "Have you ever had a conflict with a client's family member? How did you resolve it?" (Reliability & Professionalism)
12. "Some of our families have specific cultural or dietary preferences. How do you adapt to different household routines?" (General)
13. "Are you comfortable working in different areas — San Fernando, Chaguanas, Port of Spain — or do you have a preferred zone?" (General)
14. "Why did you leave your last caregiving position?" (Red-Flag Checks)
15. "Can you provide two professional references we can contact?" (Red-Flag Checks)
16. "Is there anything about how we operate — team rotations, documentation requirements, family communication — that concerns you?" (Red-Flag Checks)

All templates will be inserted as `is_active: true` so they're immediately usable without the admin needing to create them one by one.

---

### Technical Detail

- The 2 UI text changes are simple string replacements in existing components
- The 4 templates are inserted via the Supabase insert tool (data operation, not a migration)
- The `questions` column is JSONB, so each template gets an array of `{question, category}` objects
- No schema changes needed — the `screening_question_templates` table already exists

