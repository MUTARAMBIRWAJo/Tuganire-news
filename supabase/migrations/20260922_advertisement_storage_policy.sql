-- Keep existing media-library permissions outside advertisements/* while protecting ad assets.
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "media_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "media_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "media_owner_delete" ON storage.objects;

CREATE POLICY "media_authenticated_upload_non_ads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND name NOT LIKE 'advertisements/%'
);

CREATE POLICY "media_authenticated_update_non_ads"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'media'
  AND name NOT LIKE 'advertisements/%'
)
WITH CHECK (
  bucket_id = 'media'
  AND name NOT LIKE 'advertisements/%'
);

CREATE POLICY "media_authenticated_delete_non_ads"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'media'
  AND name NOT LIKE 'advertisements/%'
);

CREATE POLICY "advertisement_admin_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND name LIKE 'advertisements/%'
  AND EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "advertisement_admin_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'media'
  AND name LIKE 'advertisements/%'
  AND EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  bucket_id = 'media'
  AND name LIKE 'advertisements/%'
  AND EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "advertisement_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'media'
  AND name LIKE 'advertisements/%'
  AND EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  )
);
