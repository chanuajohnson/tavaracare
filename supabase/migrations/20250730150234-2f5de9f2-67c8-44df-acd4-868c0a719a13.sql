-- Enable RLS on all tables that have policies but RLS disabled

-- Enable RLS on tables identified by the linter
ALTER TABLE public.admin_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_match_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_visit_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automatic_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_needs_family ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_recipient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_engagement_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_health_scores ENABLE ROW LEVEL SECURITY;