
# Tuganire News

Professional multilingual news and magazine platform built with Next.js.

## Architecture

The public application uses Next.js App Router, TypeScript, and Supabase. English and Kinyarwanda UI locales are routed through `/en` and `/rw`; their shared dictionary is maintained in `lib/i18n.ts`. Editorial translations are separate Supabase article rows linked by `story_group_id`.

Useful checks:

```bash
npx tsc --noEmit
npm run check-translations
npm run build
```

The live database schema and safe inspection procedure are documented in [docs/database/SUPABASE_DATABASE_ACCESS.md](docs/database/SUPABASE_DATABASE_ACCESS.md).

## Environment Setup

Create a local environment file with the required values for Supabase, Stripe, and other services.

For Stripe monetization, define:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Keep secret values in `.env.local` and out of version control.
