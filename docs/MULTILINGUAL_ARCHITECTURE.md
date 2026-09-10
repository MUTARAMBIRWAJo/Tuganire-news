# Tuganire multilingual architecture

## Supported UI locales

The complete shared UI dictionary lives in `lib/i18n.ts`. It is the single source for English (`en`) and Kinyarwanda (`rw`) labels, accessibility text, common form messages, loading/empty states, authentication, newsletter, contact, and public navigation vocabulary. Run `node scripts/check-translations.js` or `npm run check-translations` after adding a key. The validator currently checks 163 keys in each locale.

The active locale is derived from the first URL segment, so a refresh and server render remain consistent. `LocaleDocument` keeps the document `lang` attribute synchronized after navigation.

Category records currently contain only `id`, `name`, and `slug` in the live database. No category translation table exists. The public UI therefore preserves stable category URLs and maps known category concepts to localized display terminology (`Politiki`, `Ubucuruzi`, `Imikino`, `Ikoranabuhanga`, `Imyidagaduro`, and `Isi`) without changing production schema.

## Data model

Each article has two required fields:

```text
Article
  - language: en | rw
  - story_group_id: UUID
             |
             +-- English version
             +-- Kinyarwanda version
```

The live Supabase database enforces both fields as `NOT NULL` and has a unique index on `(story_group_id, language)`. Existing standalone articles have their own story group. Articles are never grouped by title, slug, author, date, or category similarity.

## Editor workflow

1. The editor selects English or Kinyarwanda in `components/article-form.tsx`.
2. A new article receives a generated UUID as `story_group_id`.
3. An edit preserves the existing story group.
4. The article payload always includes `language` and `story_group_id`.
5. The editor checks existing versions through the story group before creating a translation.
6. A translation is a separate article row with the same story group and the opposite language.
7. The database unique index is the final duplicate-translation protection.

## Public routing and filtering

Localized public pages use:

- `/en`
- `/rw`
- `/{lang}/articles/{slug}`
- `/{lang}/category/{slug}`
- `/{lang}/search`

Every public article query applies both the requested slug/category/search criteria and `language = en|rw` at the Supabase query level. Related articles and homepage sections also receive the active language.

The shared header and footer localize their labels and preserve the active locale in navigation links. Search keeps its query string when switching locale, while article switching resolves the translated article through `story_group_id` and its real slug.

The `/articles` and `/categories` listings also have localized `/en/...` and `/rw/...` wrappers. Their API requests include the active language, and category cards preserve the returned article language when building links.

Article cards carry the returned language and link to `/{language}/articles/{slug}`. They do not link to an unscoped article URL.

## Language switching

The article switcher first loads the current article, reads its `story_group_id`, then looks up the published target-language row. It navigates using that row's actual slug. When no published translation exists, it reports that the version is unavailable and does not generate a guessed URL.

A production bilingual story group has been verified with distinct English and Kinyarwanda slugs.

## SEO

Article metadata uses the localized canonical URL. Published translations in the same story group are exposed through `alternates.languages` using their actual localized URLs. JSON-LD `Article` and `NewsArticle` objects include `inLanguage`.

## Fallback behavior

Unsupported language values normalize to English. Missing translations do not fall back to the current slug. Unexpected database schema incompatibility should fail clearly through `ensureMultilingualSchema`; the application does not silently omit multilingual fields.

## Validation

Use the live Supabase MCP connection to verify:

- language and story group columns
- unique story/language pairs
- language counts
- bilingual story groups
- localized route responses

Run `npx tsc --noEmit`, `npm run build`, and the project's tests before deployment. Browser validation should use an existing bilingual story group whenever available.

The translation checker reports key coverage. It does not translate editorial article text: article content remains controlled by the `articles.language` and `story_group_id` records.

Browser verification used the live bilingual story group `11111111-1111-1111-1111-111111111111`: the English slug resolves to the actual Rwandan slug and the Rwandan slug resolves back to the actual English slug. The public article API preserves `language` and `story_group_id` for the switcher and related-card paths.

Authentication, newsletter, contact, and their localized route wrappers are now wired to the same dictionary. Promotional, donation/payment, careers, about, privacy, terms, and cookie pages still contain page-specific copy that should be migrated before claiming 100% site-wide UI coverage.
