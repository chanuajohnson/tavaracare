
-- Update Clinical Competency: add 1 question
UPDATE screening_question_templates 
SET questions = questions || '[{"question": "How would you respond if a client falls — walk us through your steps from the moment it happens.", "category": "Clinical Competency"}]'::jsonb,
    updated_at = now()
WHERE id = '0c99a87b-7da7-4e33-9a32-db1d8147a875';

-- Update Team / Rotation Fit: add 3 questions
UPDATE screening_question_templates 
SET questions = questions || '[{"question": "Although you may be the primary assigned caregiver, we rotate caregivers so we always have a healthy pool to fill a home. How do you feel about being placed in different homes on rotation?", "category": "Team & Rotation Fit"}, {"question": "How do you support other caregivers on the team when life events, emergencies, or time-off needs come up?", "category": "Team & Rotation Fit"}, {"question": "We require daily written reports in a digital log that serves as handover notes for the next caregiver — even if you are working the next shift yourself. How comfortable are you with writing daily e-reports?", "category": "Team & Rotation Fit"}]'::jsonb,
    updated_at = now()
WHERE id = 'f192f7c5-c92a-45fd-a548-2557432f4c4c';

-- Update Reliability, Culture & Red-Flag Checks: add 4 questions
UPDATE screening_question_templates 
SET questions = questions || '[{"question": "How do you handle being late or tardy for a shift? What is your plan to make sure it does not happen?", "category": "Reliability & Professionalism"}, {"question": "How do you manage requesting time off — how much notice do you give, and how do you handle emergencies?", "category": "Reliability & Professionalism"}, {"question": "How do you keep the main family contact updated about medication needs, stock shortages, or supply issues?", "category": "Reliability & Professionalism"}, {"question": "How do you see yourself as an asset in the home — what value do you bring to the family beyond basic care tasks?", "category": "General"}]'::jsonb,
    updated_at = now()
WHERE id = '64dfe278-768c-445a-b11a-f68b03fd163c';

-- Insert new template: Cultural Sensitivity & Local Context
INSERT INTO screening_question_templates (title, questions, is_active) VALUES
('Cultural Sensitivity & Local Context', '[{"question": "Trinidad and Tobago is multi-ethnic and multi-religious. How do you handle caring for someone whose cultural background, dietary practices, or religious observances differ from your own?", "category": "General"}, {"question": "Have you ever had a situation where a family''s cultural or religious practices conflicted with your personal beliefs? How did you navigate that?", "category": "General"}, {"question": "How do you adapt your communication style when working with families from different cultural backgrounds?", "category": "General"}]'::jsonb, true);

-- Insert new template: Logistics, Transport & Professionalism
INSERT INTO screening_question_templates (title, questions, is_active) VALUES
('Logistics, Transport & Professionalism', '[{"question": "How do you get to work — do you drive, use public transport, or rely on family and friends? What is your backup plan if your usual method falls through?", "category": "Reliability & Professionalism"}, {"question": "Our policy is no personal phone use during shifts. How do you feel about working a full 8-hour shift without access to your phone?", "category": "Reliability & Professionalism"}, {"question": "If there is a personal emergency during your shift, how would you handle it given the no-phone policy?", "category": "Reliability & Professionalism"}, {"question": "What does punctuality and reliability mean to you in a caregiving role?", "category": "Reliability & Professionalism"}]'::jsonb, true);
