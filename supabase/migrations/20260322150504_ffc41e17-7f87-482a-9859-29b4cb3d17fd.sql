
-- Update "New Family On Tavara" template with location and match percentage placeholders
UPDATE nudge_templates 
SET message_template = E'Hi [Name]! 💙 Chan from Tavara Care.\n\nA new family in **[Location]** has just joined Tavara and is actively looking for care! Based on your profile, you could be a **[X]% match** — don''t miss this opportunity.\n\n✅ To ensure you''re considered for this match:\n• Make sure your profile is fully completed\n• Upload your ID and Police Certificate of Character\n• Add your professional certifications\n• Confirm your availability and service area\n\n💫 Families are matched with the most complete and responsive profiles first. Act quickly!\n\n🔗 Update your profile: https://tavaracare.lovable.app/dashboard/professional\n\nQuestions? Just reply here!\n- Chan, Tavara Care 💙',
    name = 'New Family On Tavara - Location Match'
WHERE id = 'ccde653a-6760-48bc-a35a-651ce441899a';

-- Insert new "Profile & Availability Check" template for professionals
INSERT INTO nudge_templates (name, stage, role, message_template, message_type)
VALUES (
  'Profile & Availability Check',
  'availability_check',
  'professional',
  E'Hi [Name]! 👋 Chan from Tavara Care.\n\nWe''re doing a quick check-in with our care professionals to make sure our records are up to date.\n\nCould you please confirm:\n📍 Your current location/service area — is it still accurate?\n✅ Are you still available and open to new care assignments?\n📅 Any changes to your schedule or availability?\n\nKeeping this updated helps us match you with the right families faster — and ensures you don''t miss out on opportunities near you.\n\n🔗 Update here: https://tavaracare.lovable.app/dashboard/professional\n\nJust reply to this message if anything has changed, or update your profile directly!\n- Chan, Tavara Care 💙',
  'whatsapp'
);
