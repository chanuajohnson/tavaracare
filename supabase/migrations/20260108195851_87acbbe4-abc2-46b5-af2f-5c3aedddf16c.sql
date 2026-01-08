-- Assign admin role to user (chanuajohnson5@gmail.com)
INSERT INTO public.user_roles (user_id, role)
VALUES ('f4e4ee41-4232-420f-a493-adecab839a95', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;