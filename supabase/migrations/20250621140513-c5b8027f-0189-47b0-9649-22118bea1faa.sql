
-- Add video_available column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN video_available boolean DEFAULT false;

-- Create index for better query performance on video availability
CREATE INDEX idx_profiles_video_available ON public.profiles(video_available) WHERE video_available = true;

-- Add RLS policy for users to update their own video availability
CREATE POLICY "Users can update their own video availability" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Create function to update video availability with proper validation
CREATE OR REPLACE FUNCTION public.update_video_availability(user_id_param uuid, available boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user exists and is a professional
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id_param 
    AND role = 'professional'
  ) THEN
    RAISE EXCEPTION 'User not found or not a professional';
  END IF;
  
  -- Update video availability
  UPDATE profiles 
  SET 
    video_available = available,
    updated_at = NOW()
  WHERE id = user_id_param;
END;
$$;
