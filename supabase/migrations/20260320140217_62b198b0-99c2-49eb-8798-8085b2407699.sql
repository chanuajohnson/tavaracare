-- Allow admins to SELECT from care_needs_family (so admin dashboard can see assessment status)
CREATE POLICY "Admins can view all care needs assessments"
ON public.care_needs_family
FOR SELECT
USING (public.is_current_user_admin());

-- Allow admins to SELECT from care_recipient_profiles (so admin can see legacy story status)
CREATE POLICY "Admins can view all care recipient profiles"
ON public.care_recipient_profiles
FOR SELECT
USING (public.is_current_user_admin());