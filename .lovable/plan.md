

## Plan: Expand Screening Templates with New Questions

### What's Changing

Update 3 existing templates with additional questions and create 2 new templates, based on your specific operational needs at Tavara.

---

### 1. Update "Clinical Competency" template (add 1 question)

- "How would you respond if a client falls — walk us through your steps from the moment it happens."

### 2. Update "Team / Rotation Fit" template (add 3 questions)

- "Although you may be the primary assigned caregiver, we rotate caregivers so we always have a healthy pool to fill a home. How do you feel about being placed in different homes on rotation?"
- "How do you support other caregivers on the team when life events, emergencies, or time-off needs come up?"
- "We require daily written reports in a digital log that serves as handover notes for the next caregiver — even if you're working the next shift yourself. How comfortable are you with writing daily e-reports?"

### 3. Update "Reliability, Culture & Red-Flag Checks" template (add 4 questions)

- "How do you handle being late or tardy for a shift? What's your plan to make sure it doesn't happen?"
- "How do you manage requesting time off — how much notice do you give, and how do you handle emergencies?"
- "How do you keep the main family contact updated about medication needs, stock shortages, or supply issues?"
- "How do you see yourself as an asset in the home — what value do you bring to the family beyond basic care tasks?"

### 4. Create NEW template: "Cultural Sensitivity & Local Context" (3 questions)

- "Trinidad and Tobago is multi-ethnic and multi-religious. How do you handle caring for someone whose cultural background, dietary practices, or religious observances differ from your own?"
- "Have you ever had a situation where a family's cultural or religious practices conflicted with your personal beliefs? How did you navigate that?"
- "How do you adapt your communication style when working with families from different cultural backgrounds?"

Category: General

### 5. Create NEW template: "Logistics, Transport & Professionalism" (4 questions)

- "How do you get to work — do you drive, use public transport, or rely on family and friends? What's your backup plan if your usual method falls through?"
- "Our policy is no personal phone use during shifts. How do you feel about working a full 8-hour shift without access to your phone?"
- "If there's a personal emergency during your shift, how would you handle it given the no-phone policy?"
- "What does punctuality and reliability mean to you in a caregiving role?"

Category: Reliability & Professionalism

---

### Technical Detail

- Existing templates are updated via database migration using `UPDATE ... SET questions = questions || new_questions`
- 2 new templates are inserted via `INSERT INTO screening_question_templates`
- All changes are JSONB operations on the `questions` column
- No schema changes needed

