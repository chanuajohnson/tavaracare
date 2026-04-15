INSERT INTO nudge_templates (name, message_template, role, stage, message_type) VALUES
(
  'Weekly Payment Reminder (Thursday)',
  E'💙 Hi {{family_name}}!\n\nThis is a friendly reminder from Tavara Care.\n\nYour weekly care payment of **{{amount}}** is due by Thursday to ensure your caregiver receives their compensation on time (Friday).\n\n🏦 Bank Transfer Details:\nBank: {{bank_name}}\nAccount: {{account_number}}\nReference: {{billing_period}}\n\nPlease send a screenshot of your transfer confirmation to this number once complete.\n\nThank you for keeping our care team compensated on schedule! 🤝\n— Chan, Tavara Care',
  'family',
  'billing',
  'whatsapp'
),
(
  'Monthly Payment Reminder',
  E'💙 Hi {{family_name}}!\n\nYour monthly care invoice for **{{billing_period}}** is ready.\n\n💰 Total Due: **{{amount}}**\n\n🏦 Bank Transfer Details:\nBank: {{bank_name}}\nAccount: {{account_number}}\nReference: {{billing_period}}\n\n⏰ Please transfer by Thursday to ensure Friday caregiver payment.\n\nQuestions about your invoice? Reply here or check your dashboard.\n\nThank you! 🤝\n— Chan, Tavara Care',
  'family',
  'billing',
  'whatsapp'
),
(
  'Payment Overdue — Gentle Follow-up',
  E'💙 Hi {{family_name}},\n\nWe noticed your care payment of **{{amount}}** for {{billing_period}} hasn''t been received yet.\n\nYour caregiver depends on timely compensation to continue providing excellent care. Please arrange the transfer at your earliest convenience.\n\n🏦 Bank: {{bank_name}}\nAccount: {{account_number}}\n\nOnce transferred, kindly send a screenshot confirmation here so we can update your records.\n\nIf there''s any issue, please let us know — we''re here to help. 🤝\n— Chan, Tavara Care',
  'family',
  'billing',
  'whatsapp'
),
(
  'Payment Received — Thank You + Receipt',
  E'✅ Hi {{family_name}}!\n\nWe''ve received your payment of **{{amount}}** for {{billing_period}}. Thank you!\n\nYour receipt is available on your Tavara dashboard. Your caregiver will be compensated on schedule. 💙\n\nWe truly appreciate your commitment to quality care for your loved one. 🤝\n— Chan, Tavara Care',
  'family',
  'billing',
  'whatsapp'
),
(
  'Care Readiness / Home Setup',
  E'💙 Hi {{family_name}}!\n\nYour caregiver is scheduled to begin soon! Here are a few things to prepare:\n\n✅ Clear workspace area for the caregiver\n✅ Prepare any medication lists or care notes\n✅ Ensure house keys / access arrangements\n✅ Share any dietary preferences or restrictions\n✅ Note emergency contact numbers in a visible spot\n\nCheck your dashboard for the full Care Readiness Checklist.\n\nQuestions? Reply here anytime! 🤝\n— Chan, Tavara Care',
  'family',
  'billing',
  'whatsapp'
),
(
  'New Match Available',
  E'💪 Hi {{caregiver_name}}!\n\nGreat news — we have a new care opportunity that matches your profile!\n\n👤 Family: {{family_name}}\n📍 Location: {{location}}\n⏰ Schedule: {{schedule}}\n\nPlease log into your Tavara dashboard to review the details and confirm your availability.\n\nFirst to respond gets priority! 🌟\n— TAV, Tavara Care Coordinator',
  'professional',
  'post_onboarding',
  'whatsapp'
),
(
  'Match Confirmed — Welcome',
  E'🎉 Hi {{caregiver_name}}!\n\nYou''ve been matched with the {{family_name}} family! Welcome to their care team.\n\n📅 Start Date: {{start_date}}\n📍 Location: {{location}}\n\nPlease review your care plan and schedule on your dashboard before your first shift.\n\nWe''re excited to have you on board! 💙\n— TAV, Tavara Care Coordinator',
  'professional',
  'post_onboarding',
  'whatsapp'
),
(
  'Payment Processed — Thank You',
  E'✅ Hi {{caregiver_name}}!\n\nYour payment of **{{amount}}** for {{billing_period}} has been processed. 🎉\n\nThank you for your dedication and excellent care. Your commitment makes a real difference in the lives of the families you serve. 💙\n\nCheck your dashboard for the full payment breakdown.\n\nKeep up the amazing work! 💪\n— Chan, Tavara Care',
  'professional',
  'post_onboarding',
  'whatsapp'
);