-- Read-only database diagnostics for Tuganire
-- This script checks the schema and relevant constraints/indexes without modifying data.

SELECT table_schema,
       table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT table_schema,
       table_name,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'articles'
ORDER BY ordinal_position;

SELECT tc.table_schema,
       tc.table_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'articles'
  AND tc.constraint_type = 'FOREIGN KEY';

SELECT tc.table_schema,
       tc.table_name,
       tc.constraint_name,
       tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'articles';

SELECT schemaname,
       tablename,
       indexname,
       indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'articles'
ORDER BY indexname;

SELECT schemaname,
       tablename,
       rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'articles';

SELECT schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual,
       with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'articles';

SELECT table_schema,
       table_name,
       column_name,
       column_default,
       is_nullable,
       data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'articles'
  AND column_name IN ('language', 'story_group_id');

SELECT id,
       slug,
       title,
       language,
       story_group_id,
       status
FROM public.articles
ORDER BY created_at DESC
LIMIT 10;