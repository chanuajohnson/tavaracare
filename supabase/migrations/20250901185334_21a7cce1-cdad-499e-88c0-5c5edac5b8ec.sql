-- WhatsApp Business API Foundation Tables (Separate from existing WhatsApp system)

-- Official WhatsApp API message templates (pre-approved by Meta)
CREATE TABLE public.whatsapp_api_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_category TEXT NOT NULL, -- 'utility', 'marketing', 'authentication'
  language_code TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  template_content JSONB NOT NULL, -- WhatsApp template structure
  variables JSONB DEFAULT '[]'::jsonb, -- Template variables/placeholders
  meta_template_id TEXT, -- WhatsApp's assigned template ID after approval
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- API message delivery tracking
CREATE TABLE public.whatsapp_api_message_delivery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL UNIQUE, -- WhatsApp's message ID
  recipient_phone TEXT NOT NULL,
  template_name TEXT,
  template_variables JSONB DEFAULT '{}'::jsonb,
  message_content TEXT,
  message_type TEXT NOT NULL DEFAULT 'template', -- 'template', 'text', 'media'
  delivery_status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
  failure_reason TEXT,
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  webhook_data JSONB DEFAULT '{}'::jsonb -- Raw webhook data from WhatsApp
);

-- Daily care notes specific to API integration
CREATE TABLE public.whatsapp_api_care_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  care_plan_id UUID REFERENCES care_plans(id),
  caregiver_id UUID REFERENCES auth.users(id),
  family_id UUID REFERENCES auth.users(id),
  whatsapp_message_id TEXT, -- Reference to message that prompted this note
  note_content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'daily_update', -- 'daily_update', 'medication', 'emergency', 'routine'
  media_urls JSONB DEFAULT '[]'::jsonb, -- Photos/videos sent via WhatsApp
  structured_data JSONB DEFAULT '{}'::jsonb, -- Parsed structured responses
  submitted_via_whatsapp BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- User opt-in/consent for API messaging
CREATE TABLE public.whatsapp_api_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  phone_number TEXT NOT NULL,
  formatted_phone TEXT NOT NULL, -- E.164 format for WhatsApp API
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_method TEXT, -- 'website', 'sms', 'call', 'in_person'
  opt_out_date TIMESTAMP WITH TIME ZONE,
  opt_out_reason TEXT,
  message_categories JSONB DEFAULT '["care_updates", "appointments", "medications"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- WhatsApp API webhook events log
CREATE TABLE public.whatsapp_api_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'message', 'status', 'error'
  phone_number TEXT,
  message_id TEXT,
  raw_payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.whatsapp_api_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_api_message_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_api_care_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_api_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_api_webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for WhatsApp API Templates
CREATE POLICY "Admins can manage all API templates" 
ON public.whatsapp_api_templates 
FOR ALL 
USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

CREATE POLICY "Users can view approved API templates" 
ON public.whatsapp_api_templates 
FOR SELECT 
USING (status = 'approved');

-- RLS Policies for Message Delivery
CREATE POLICY "Users can view their own API message delivery" 
ON public.whatsapp_api_message_delivery 
FOR SELECT 
USING (sent_by = auth.uid() OR EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() 
  AND p.phone_number = whatsapp_api_message_delivery.recipient_phone
));

CREATE POLICY "Authenticated users can create API message delivery records" 
ON public.whatsapp_api_message_delivery 
FOR INSERT 
WITH CHECK (sent_by = auth.uid());

-- RLS Policies for Care Notes API
CREATE POLICY "Family and caregivers can view API care notes" 
ON public.whatsapp_api_care_notes 
FOR SELECT 
USING (family_id = auth.uid() OR caregiver_id = auth.uid());

CREATE POLICY "Caregivers can create API care notes" 
ON public.whatsapp_api_care_notes 
FOR INSERT 
WITH CHECK (caregiver_id = auth.uid());

-- RLS Policies for Consent
CREATE POLICY "Users can manage their own API consent" 
ON public.whatsapp_api_consent 
FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for Webhook Events (Admin only)
CREATE POLICY "Admins can manage API webhook events" 
ON public.whatsapp_api_webhook_events 
FOR ALL 
USING (COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin');

-- Create indexes for performance
CREATE INDEX idx_whatsapp_api_templates_status ON whatsapp_api_templates(status);
CREATE INDEX idx_whatsapp_api_message_delivery_recipient ON whatsapp_api_message_delivery(recipient_phone);
CREATE INDEX idx_whatsapp_api_message_delivery_status ON whatsapp_api_message_delivery(delivery_status);
CREATE INDEX idx_whatsapp_api_care_notes_care_plan ON whatsapp_api_care_notes(care_plan_id);
CREATE INDEX idx_whatsapp_api_consent_phone ON whatsapp_api_consent(formatted_phone);
CREATE INDEX idx_whatsapp_api_webhook_events_processed ON whatsapp_api_webhook_events(processed);