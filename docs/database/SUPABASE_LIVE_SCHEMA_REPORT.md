# Supabase live schema report

Verified through the official Supabase MCP connection for project `ziyliypjwheccdwxkfke` on 2026-09-10.

## Connection

- MCP configuration: present in [.vscode/mcp.json](../../.vscode/mcp.json)
- MCP authentication: verified by successful live SQL queries
- Live database access: verified
- Project reference: `ziyliypjwheccdwxkfke`
- Service-role credentials: not used by MCP

## public.articles

The live table contains 368 rows and is protected by RLS.

Relevant columns:

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | `gen_random_uuid()` |
| slug | text | NO | none |
| title | text | NO | none |
| excerpt | text | YES | none |
| content | text | NO | none |
| status | text | NO | `'draft'::text` |
| author_id | uuid | YES | none |
| category_id | integer | YES | none |
| published_at | timestamptz | YES | none |
| language | text | NO | `'en'::text` |
| story_group_id | uuid | NO | none |

The table also contains the existing media, SEO, video, metrics, and timestamp columns used by the application.

## Constraints and relationships

- Primary key: `articles_pkey (id)`
- Unique constraint: `articles_slug_key (slug)`
- Foreign key: `author_id -> app_users.id`
- Foreign key: `category_id -> categories.id`
- Check constraint: `articles_language_check`
- Check constraint: `articles_article_type_chk`
- Trigger: `set_updated_at` before update, calling `handle_updated_at()`

## Multilingual indexes

- `idx_articles_language`
- `idx_articles_story_group_id`
- `idx_articles_story_group_language_unique (story_group_id, language)` unique
- `idx_articles_language_status (language, status)`
- `idx_articles_story_group_language_status (story_group_id, language, status)`

## RLS policies

RLS is enabled. Live policies include public read policies for published articles, own-article read/update policies, authenticated insert protection by `author_id = auth.uid()`, and the public view-counter update policy. No RLS policy was changed by the multilingual migration.

## Data migration result

Before finalization:

- Articles: 368
- English: 366
- Kinyarwanda: 2
- Missing language: 0
- Missing story group: 365
- Story groups: 2
- Duplicate `(story_group_id, language)` pairs: 0

The migration assigned a separate UUID to each previously ungrouped article. After finalization:

- Articles: 368
- English: 366
- Kinyarwanda: 2
- Missing language: 0
- Missing story group: 0
- Story groups: 367
- Duplicate `(story_group_id, language)` pairs: 0

Existing article count was preserved.

## Repository drift

The repository migrations already contained the language and story-group columns and partial uniqueness index. The live database contained those columns and indexes, but both columns were nullable and most existing rows were ungrouped. The new migration `enforce_multilingual_article_integrity` finalized the live constraints and backfilled only missing grouping metadata without deleting or regrouping existing records.

## Validation scope

Live schema, constraints, indexes, RLS policies, tables, triggers, relationships, language counts, null counts, and duplicate pairs were inspected through MCP. Application TypeScript diagnostics are clean. Full build/lint results are recorded separately after execution.
