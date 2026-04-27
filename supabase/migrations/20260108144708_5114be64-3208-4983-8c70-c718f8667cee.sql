-- Create flyer_locations table for tracking distribution locations
CREATE TABLE public.flyer_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  business_name TEXT NOT NULL,
  address TEXT,
  variant TEXT DEFAULT 'A',
  flyers_count INTEGER DEFAULT 0,
  placed_date DATE,
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.flyer_locations ENABLE ROW LEVEL SECURITY;

-- Create policies - admins can manage, public can read for analytics
CREATE POLICY "Admins can manage flyer locations" ON public.flyer_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view flyer locations" ON public.flyer_locations
  FOR SELECT USING (true);

-- Create index for faster lookups
CREATE INDEX idx_flyer_locations_code ON public.flyer_locations(code);
CREATE INDEX idx_flyer_locations_category ON public.flyer_locations(category);

-- Add updated_at trigger
CREATE TRIGGER update_flyer_locations_updated_at
  BEFORE UPDATE ON public.flyer_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();