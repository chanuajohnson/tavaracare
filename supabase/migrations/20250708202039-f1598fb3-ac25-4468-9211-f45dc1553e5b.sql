-- Add available_for_matching field to profiles table
ALTER TABLE profiles 
ADD COLUMN available_for_matching BOOLEAN NOT NULL DEFAULT true;

-- Add index for better performance when filtering by matching availability
CREATE INDEX idx_profiles_available_for_matching ON profiles(available_for_matching);

-- Add RLS policy for admins to update matching availability
CREATE POLICY "Admins can update matching availability" ON profiles
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);