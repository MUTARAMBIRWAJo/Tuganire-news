-- Prevent authenticated non-admin users from reading unpublished advertisements.
DROP POLICY IF EXISTS "Authenticated users can read all advertisements" ON public.advertisements;

CREATE POLICY "Admins can read all advertisements"
ON public.advertisements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.app_users
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  )
);

GRANT SELECT ON public.advertisements TO anon, authenticated, public;
