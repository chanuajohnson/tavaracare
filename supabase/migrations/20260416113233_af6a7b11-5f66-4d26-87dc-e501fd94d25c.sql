
-- Replace all {{family_name}} and {{caregiver_name}} with [Name]
UPDATE nudge_templates
SET message_template = REPLACE(REPLACE(message_template, '{{family_name}}', '[Name]'), '{{caregiver_name}}', '[Name]')
WHERE message_template LIKE '%{{family_name}}%' OR message_template LIKE '%{{caregiver_name}}%';

-- Replace bank placeholders with actual details in Weekly Payment Reminder
UPDATE nudge_templates
SET message_template = E'\U0001F499 Hi [Name]!\n\nThis is a friendly reminder from Tavara Care.\n\nYour weekly care payment of **{{amount}}** is due by Thursday to ensure your caregiver receives their compensation on time (Friday).\n\n\U0001F3E6 Bank Transfer Details:\nBank: First Citizens Bank, Point Lisas\nAccount: 2991223\nName: Chanua Johnson\nAccount Type: Savings\nReference: {{billing_period}}\n\nWhen complete, send a screenshot to confirm the payment/bank transfer via WhatsApp or email.\n\nThank you for keeping our care team compensated on schedule! \U0001F91D\n— Chan, Tavara Care'
WHERE name = 'Weekly Payment Reminder (Thursday)';

-- Update Monthly Payment Reminder
UPDATE nudge_templates
SET message_template = E'\U0001F499 Hi [Name]!\n\nYour monthly care invoice for **{{billing_period}}** is ready.\n\n\U0001F4B0 Total Due: **{{amount}}**\n\n\U0001F3E6 Bank Transfer Details:\nBank: First Citizens Bank, Point Lisas\nAccount: 2991223\nName: Chanua Johnson\nAccount Type: Savings\nReference: {{billing_period}}\n\n\u23F0 Please transfer by Thursday to ensure Friday caregiver payment.\n\nQuestions about your invoice? Reply here or check your dashboard.\n\nThank you! \U0001F91D\n— Chan, Tavara Care'
WHERE name = 'Monthly Payment Reminder';

-- Update Payment Overdue
UPDATE nudge_templates
SET message_template = E'\U0001F499 Hi [Name],\n\nWe noticed your care payment of **{{amount}}** for {{billing_period}} hasn''t been received yet.\n\nYour caregiver depends on timely compensation to continue providing excellent care. Please arrange the transfer at your earliest convenience.\n\n\U0001F3E6 Bank Transfer Details:\nBank: First Citizens Bank, Point Lisas\nAccount: 2991223\nName: Chanua Johnson\nAccount Type: Savings\n\nOnce transferred, kindly send a screenshot confirmation via WhatsApp or email so we can update your records.\n\nIf there''s any issue, please let us know — we''re here to help. \U0001F91D\n— Chan, Tavara Care'
WHERE name = 'Payment Overdue — Gentle Follow-up';
