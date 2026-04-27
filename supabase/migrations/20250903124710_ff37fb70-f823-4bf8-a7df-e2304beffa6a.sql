-- Create TAV Core Demo Infrastructure Tables
-- Table for tracking demo usage and analytics
CREATE TABLE public.tav_demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_type TEXT NOT NULL DEFAULT 'interactive', -- 'interactive', 'form_preview', 'customization'
  session_token TEXT UNIQUE NOT NULL,
  visitor_ip TEXT,
  visitor_location JSONB DEFAULT '{}'::jsonb,
  conversation_data JSONB DEFAULT '[]'::jsonb,
  form_interactions INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  demo_duration_seconds INTEGER DEFAULT 0,
  lead_captured BOOLEAN DEFAULT false,
  email_captured TEXT,
  company_name TEXT,
  use_case_selected TEXT, -- 'registration', 'interview', 'feedback', 'support', 'custom'
  customization_preferences JSONB DEFAULT '{}'::jsonb,
  conversion_stage TEXT DEFAULT 'demo', -- 'demo', 'lead', 'trial', 'paid'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for lead capture and qualification
CREATE TABLE public.tav_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_session_id UUID REFERENCES public.tav_demo_sessions(id),
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  company_size TEXT, -- 'startup', 'small', 'medium', 'enterprise'
  industry TEXT,
  use_case TEXT NOT NULL,
  budget_range TEXT, -- 'under_100', '100_500', '500_1000', '1000_plus'
  timeline TEXT, -- 'immediate', 'month', 'quarter', 'planning'
  technical_expertise TEXT, -- 'beginner', 'intermediate', 'advanced'
  lead_score INTEGER DEFAULT 0,
  qualification_status TEXT DEFAULT 'new', -- 'new', 'qualified', 'unqualified', 'contacted', 'converted'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for TAV usage analytics and metrics
CREATE TABLE public.tav_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.tav_demo_sessions(id),
  metric_type TEXT NOT NULL, -- 'conversation_started', 'form_filled', 'lead_captured', 'demo_completed'
  metric_value NUMERIC DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for TAV subscription plans and features
CREATE TABLE public.tav_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL, -- 'demo', 'starter', 'professional', 'enterprise', 'custom'
  price_monthly NUMERIC,
  price_annual NUMERIC,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "conversations_per_month": 1000, "forms": 5, "customization": true }
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default TAV plans
INSERT INTO public.tav_plans (plan_name, plan_type, price_monthly, price_annual, features, limits, display_order) VALUES
('Demo Access', 'demo', 0, 0, '["Live demo", "3 pre-built scenarios", "Basic customization preview"]', '{"conversations_per_session": 10, "forms": 1, "customization": false}', 1),
('TAV Starter', 'starter', 49, 490, '["Up to 3 custom forms", "Basic analytics", "Email support", "Standard integrations"]', '{"conversations_per_month": 1000, "forms": 3, "customization": "basic"}', 2),
('TAV Professional', 'professional', 149, 1490, '["Unlimited forms", "Advanced analytics", "Priority support", "Custom branding", "API access"]', '{"conversations_per_month": 5000, "forms": "unlimited", "customization": "advanced"}', 3),
('TAV Enterprise', 'enterprise', null, null, '["Custom deployment", "Dedicated support", "White-label solution", "Advanced integrations", "Custom training"]', '{"conversations_per_month": "unlimited", "forms": "unlimited", "customization": "full"}', 4);

-- Enable RLS on all tables
ALTER TABLE public.tav_demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tav_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tav_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tav_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for demo sessions (public access for demos)
CREATE POLICY "Allow public demo session creation" ON public.tav_demo_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow session token access" ON public.tav_demo_sessions
FOR ALL USING (session_token = current_setting('request.headers', true)::json->>'x-demo-token');

-- RLS Policies for leads (public insertion, admin access)
CREATE POLICY "Allow public lead creation" ON public.tav_leads
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can access all leads" ON public.tav_leads
FOR ALL USING (
  COALESCE((((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text), 'family'::text) = 'admin'::text
);

-- RLS Policies for analytics (public insertion, admin access)
CREATE POLICY "Allow public analytics creation" ON public.tav_analytics
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can access all analytics" ON public.tav_analytics
FOR ALL USING (
  COALESCE((((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text), 'family'::text) = 'admin'::text
);

-- RLS Policies for plans (public read access)
CREATE POLICY "Plans are publicly viewable" ON public.tav_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.tav_plans
FOR ALL USING (
  COALESCE((((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text), 'family'::text) = 'admin'::text
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_tav_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tav_demo_sessions_updated_at
  BEFORE UPDATE ON public.tav_demo_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_tav_updated_at();

CREATE TRIGGER update_tav_leads_updated_at
  BEFORE UPDATE ON public.tav_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_tav_updated_at();

CREATE TRIGGER update_tav_plans_updated_at
  BEFORE UPDATE ON public.tav_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_tav_updated_at();