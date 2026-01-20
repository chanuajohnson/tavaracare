-- Grant admin privileges to kwame.healthtech@gmail.com
-- User ID: e02ec4b5-797b-4d60-9809-f6b38ba1da30

-- 1. Insert admin role into user_roles table
INSERT INTO public.user_roles (user_id, role)
VALUES ('e02ec4b5-797b-4d60-9809-f6b38ba1da30', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Update profile role to admin
UPDATE public.profiles 
SET role = 'admin', updated_at = NOW()
WHERE id = 'e02ec4b5-797b-4d60-9809-f6b38ba1da30';