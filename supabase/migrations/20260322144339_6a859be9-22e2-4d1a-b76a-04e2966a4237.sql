-- Insert new nudge templates
INSERT INTO nudge_templates (name, stage, role, message_template, message_type)
VALUES 
(
  'Professional Matched - Welcome',
  'matched',
  'professional',
  E'Hi [Name]! 🎉 Chan from Tavara Care.\n\nGreat news — you''ve been matched with a family who needs your care expertise! This is a real milestone in your Tavara journey.\n\nPlease check your dashboard to review the family''s care needs and confirm your availability. The sooner you respond, the sooner we can get things moving!\n\n🔗 View your match: https://tavaracare.lovable.app/dashboard/professional\n\nQuestions? Just reply here — I''m happy to help!\n- Chan, Tavara Care 💙',
  'whatsapp'
),
(
  'Family Caregiver Unavailable - Apology',
  'caregiver_unavailable',
  'family',
  E'Hi [Name]! 💙 Chan from Tavara Care.\n\nWe sincerely apologize — your matched caregiver has become temporarily unavailable due to personal circumstances. We understand this is disappointing and we''re working quickly to resolve it.\n\nHere''s what''s happening next:\n✅ We''ve already begun matching you with the next best available caregiver\n📞 Our admin team will reach out within 24 hours with your updated match\n\nIn the meantime, you can check your revised matches anytime:\n🔗 https://tavaracare.lovable.app/family/matching\n\nThank you for your patience — your family''s care is our priority!\n- Chan, Tavara Care 💙',
  'whatsapp'
);

-- Fix Ana's nudge records message_type from 'custom' to 'whatsapp'
UPDATE admin_communications 
SET message_type = 'whatsapp' 
WHERE id IN ('262fde26-baa1-464f-bfa5-0eec1d9fbd95', '7b9c2ba0-09e1-47ec-864f-829a7f4153e9');