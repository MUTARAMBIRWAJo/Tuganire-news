const DEFAULT_REDIRECT_TO = "/dashboard"

function normalizeRedirectTo(redirectTo?: string) {
  if (!redirectTo) return DEFAULT_REDIRECT_TO
  if (!redirectTo.startsWith("/")) return DEFAULT_REDIRECT_TO
  return redirectTo
}

export function buildAuthLoginHref(redirectTo?: string) {
  const target = normalizeRedirectTo(redirectTo)
  return `/auth/login?redirectTo=${encodeURIComponent(target)}`
}

export function buildAuthSignUpHref(redirectTo?: string) {
  const target = normalizeRedirectTo(redirectTo)
  return `/auth/sign-up?redirectTo=${encodeURIComponent(target)}`
}

export function getRedirectTarget(value: string | null | undefined) {
  return normalizeRedirectTo(value ?? undefined)
}