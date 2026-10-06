# Authentication Security Operations

## TOTP Recovery

Supabase Auth TOTP is supported for enrollment and login. This application does not support recovery codes, and the TOTP setup secret is not a recovery code.

Users who lose their authenticator cannot disable MFA from an AAL1 session. They must contact an administrator through a separately verified support channel. The administrator must verify account ownership outside the signed-in session and use a provider-supported Supabase administrative recovery process. Do not ask the user to send a password, TOTP secret, access token, or refresh token. After recovery, the user must enroll and verify a new authenticator before resuming protected work.

Do not add an in-app "forgot MFA" action that removes a factor based only on possession of an existing session or access to the account email.

## Session and MFA Policy

- Browser authentication uses the shared Supabase browser client and the normal Supabase session lifecycle.
- Server-rendered requests use request-scoped Supabase SSR clients and the Next.js proxy for cookie refresh.
- Verified TOTP factors require AAL2 for protected dashboard/API requests and for rows covered by the AAL RLS migration.
- MFA factor removal requires a fresh TOTP challenge and a confirmed AAL2 session.
- Logging out removes only the current local session; it does not terminate other devices.
- Invalid refresh tokens are cleared by Supabase Auth's non-retryable session-removal path and redirected to login by the proxy. Do not add manual token storage or a token-copy endpoint.

## Inactivity Timeout

Authenticated sessions warn after five minutes without pointer, keyboard, scroll, wheel, touch, or in-app route activity. Users then have five minutes to continue or log out. Both periods are calculated from timestamps so suspension or timer throttling does not extend the deadline. Interaction does not dismiss an already-open warning; the user must choose to continue.

The last-activity timestamp is non-sensitive and stored in `localStorage` so reloads preserve the timeout and activity in one tab is shared with other tabs in the same browser profile. It is not an authentication credential. Supabase tokens remain managed by Supabase SSR cookies, and logging out in one browser profile does not terminate sessions on other devices.

For local authenticated testing, set `NEXT_PUBLIC_SESSION_TIMEOUT_TEST_MODE=true` in the development environment and restart the dev server. Only `NODE_ENV=development` plus the exact value `true` enables 30-second idle and 30-second warning periods. Empty or invalid values, test runs, and all production builds use 300,000 ms for both periods. Remove the flag after testing. This flag contains no credential and has no effect on authentication or MFA.

## RLS Migration

`supabase/migrations/202610060001_enforce_aal2_for_mfa_users.sql` adds a restrictive policy to public tables that already have RLS enabled. It requires AAL2 only for users with a verified MFA factor and leaves the existing role/ownership policies in place. Apply and test this migration through the normal reviewed database deployment process before relying on it in production. Tables created later must receive an equivalent policy in their own migration.