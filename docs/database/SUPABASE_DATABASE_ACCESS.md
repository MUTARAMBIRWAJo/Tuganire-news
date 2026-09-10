# Supabase database access and schema inspection

## Purpose

This project uses a Supabase-backed Next.js application. The database is the source of truth for article, category, author, and multilingual metadata.

This document records the approved, read-only workflow for inspecting the live project schema without exposing secrets or making destructive changes.

## Required environment variables

The following project variables are expected to exist in the local environment:

- NEXT_PUBLIC_SUPABASE_URL: FOUND
- NEXT_PUBLIC_SUPABASE_ANON_KEY: FOUND
- SUPABASE_SERVICE_ROLE_KEY: FOUND
- SUPABASE_PROJECT_ID: NOT FOUND in local repo files
- Supabase CLI configuration: NOT REQUIRED for the verified MCP workflow

The project uses the public Supabase project URL and project reference already exposed in the workspace configuration.

## Approved connection method

This environment is configured to use the official Supabase MCP endpoint:

- Project reference: ziyliypjwheccdwxkfke
- Endpoint: https://mcp.supabase.com/mcp?project_ref=ziyliypjwheccdwxkfke&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching

This connection has been verified with live read-only SQL queries against `public.articles`. If VS Code displays an OAuth prompt, approve the official Supabase account/project authorization in the browser; do not enter credentials into source files. Do not add service-role credentials to MCP config unless Supabase explicitly requires a privileged tool for the requested task.

## Safe inspection workflow

1. Open the workspace in VS Code with the MCP config in [.vscode/mcp.json](.vscode/mcp.json).
2. In the Copilot/agent environment, ask for a read-only schema check of the public schema.
3. Validate the real live database before modifying any code that depends on article or multilingual fields.
4. Prefer live schema verification over inferred migration files.

To verify the connection, ask the agent to list the public tables and describe `public.articles`. A successful response must include live columns such as `language` and `story_group_id`, rather than only reading files under `supabase/migrations`.

## Read-only checks

Examples of approved operations:

- Show tables in public schema
- Describe public.articles
- Inspect columns, constraints, indexes, and foreign keys
- Check row-level security policies
- Sample a few rows without dumping the database
- Compare live schema to repository migrations

## Forbidden operations

The following must never be run without explicit authorization:

- supabase db reset
- supabase db push --force
- DROP TABLE
- DROP SCHEMA
- DELETE FROM public.articles
- TRUNCATE
- destructive migration execution

## Local repository checks

The repository includes multilingual migration files under [supabase/migrations](../../supabase/migrations). These should be treated as hints, not as proof of the live database state. The verified live integrity migration is [20260910_enforce_multilingual_article_integrity.sql](../../supabase/migrations/20260910_enforce_multilingual_article_integrity.sql).

The real source of truth is the current Supabase project.

## Database inspection targets

Focus on the following live objects:

- public.articles
- public.categories
- public.profiles
- public.comments
- public.likes
- public.views
- public.tags
- public.article_tags
- public.authors

For multilingual implementation, verify these fields on public.articles:

- language
- story_group_id

Only proceed with code changes after the live schema confirms the field names, types, and constraints.

## Migration workflow

1. Inspect the live database schema.
2. Compare with repository migrations.
3. Check for missing columns or drift.
4. If a column is missing, create a safe migration only after inspecting current data and constraints.
5. Validate the migration with a read-only schema query before and after execution.

## Contact and support

If Supabase MCP authentication or project linking is not available in the local IDE, connect the current workspace to the correct project and then re-run the live schema inspection. The repository should not be modified based on assumptions if the database connection is unavailable.
