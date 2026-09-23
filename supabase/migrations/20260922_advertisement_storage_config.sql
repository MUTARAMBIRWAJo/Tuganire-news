-- Align the existing media bucket with the advertisement uploader's supported formats.
UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm'
  ]::text[]
WHERE id = 'media';
