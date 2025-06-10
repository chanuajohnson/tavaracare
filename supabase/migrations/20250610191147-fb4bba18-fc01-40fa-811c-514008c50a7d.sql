
-- Step 1: Recreate the missing handle_new_user() trigger with proper type casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role text;
  admin_code text;
BEGIN
  -- Get role from metadata, defaulting to 'family'
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'family');
  
  -- If user is trying to sign up as admin, validate the admin code
  IF user_role = 'admin' THEN
    admin_code := new.raw_user_meta_data->>'admin_code';
    
    -- Check if admin code is provided and valid
    IF admin_code IS NULL OR NOT public.validate_admin_signup_code(admin_code) THEN
      RAISE EXCEPTION 'Invalid admin signup code provided';
    END IF;
  END IF;
  
  -- Create profile with validated role (properly cast to user_role enum)
  INSERT INTO public.profiles (
    id, 
    role, 
    full_name,
    first_name,
    last_name,
    created_at,
    updated_at
  )
  VALUES (
    new.id, 
    user_role::user_role,
    COALESCE(new.raw_user_meta_data->>'full_name', NULL),
    COALESCE(new.raw_user_meta_data->>'first_name', NULL),
    COALESCE(new.raw_user_meta_data->>'last_name', NULL),
    NOW(),
    NOW()
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise to block invalid admin signups
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 2: Backfill missing profiles for existing users with proper type casting
DO $$
DECLARE
    auth_user_record RECORD;
    user_role_text TEXT;
BEGIN
    -- Create profiles for users that don't have them
    FOR auth_user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        -- Get the role and ensure it's valid
        user_role_text := COALESCE(auth_user_record.raw_user_meta_data->>'role', 'family');
        
        -- Validate the role exists in the enum, default to 'family' if invalid
        IF user_role_text NOT IN ('family', 'professional', 'community', 'admin') THEN
            user_role_text := 'family';
        END IF;
        
        INSERT INTO public.profiles (
            id,
            role,
            full_name,
            first_name,
            last_name,
            created_at,
            updated_at
        ) VALUES (
            auth_user_record.id,
            user_role_text::user_role,
            COALESCE(auth_user_record.raw_user_meta_data->>'full_name', NULL),
            COALESCE(auth_user_record.raw_user_meta_data->>'first_name', NULL),
            COALESCE(auth_user_record.raw_user_meta_data->>'last_name', NULL),
            auth_user_record.created_at,
            NOW()
        );
        
        RAISE LOG 'Created profile for user: % with role: %', auth_user_record.email, user_role_text;
    END LOOP;
END $$;

-- Step 3: Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS background_check_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS verification_badge_earned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS professional_type TEXT,
ADD COLUMN IF NOT EXISTS years_of_experience TEXT,
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS visit_payment_status TEXT,
ADD COLUMN IF NOT EXISTS visit_payment_reference TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Add missing columns to professional_documents table
ALTER TABLE professional_documents 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS document_subtype TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Step 5: Create storage bucket for professional documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('professional-documents', 'professional-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Create RLS policies for professional documents storage
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'professional-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'professional-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'professional-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 7: Ensure RLS is enabled on professional_documents table
ALTER TABLE professional_documents ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policy for professional_documents
DROP POLICY IF EXISTS "Users can manage their own documents" ON professional_documents;
CREATE POLICY "Users can manage their own documents" ON professional_documents
FOR ALL USING (auth.uid() = user_id);

-- Step 8: Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles if they don't exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Allow users to view profiles they have access to through care relationships
DROP POLICY IF EXISTS "Users can view accessible profiles" ON profiles;
CREATE POLICY "Users can view accessible profiles" ON profiles
FOR SELECT USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM care_plans cp
    WHERE cp.family_id = profiles.id
    AND (
      auth.uid() = cp.family_id
      OR EXISTS (
        SELECT 1 FROM care_tasks ct
        WHERE ct.care_plan_id = cp.id
        AND ct.assigned_to = auth.uid()
      )
    )
  )
);
