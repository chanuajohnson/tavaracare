-- Remove incorrect admin role from chanuajohnson5@gmail.com
DELETE FROM public.user_roles 
WHERE user_id = 'f4e4ee41-4232-420f-a493-adecab839a95' 
AND role = 'admin';

-- Add correct admin role to chanuajohnson3@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('6d089663-8794-444e-99fa-ae480d3f3c35', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;