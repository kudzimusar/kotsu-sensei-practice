-- Add admin role to your user account
INSERT INTO public.user_roles (user_id, role)
VALUES ('63908300-f3df-4fff-ab25-cc268e00a45b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;