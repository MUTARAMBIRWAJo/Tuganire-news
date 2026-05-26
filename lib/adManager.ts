export type AdNetworkName = "adsense" | "adskeeper"

export type AdRouteState = {
  pathname: string
  publicContent: boolean
  adsenseEnabled: boolean
  adskeeperEnabled: boolean
}

export const AD_NETWORK_SCRIPT_IDS = {
  adsense: "tuganire-google-adsense-script",
  adskeeper: "tuganire-adskeeper-script",
} as const

const DEFAULT_ADSENSE_CLIENT = "ca-pub-1524579863977140"
const DEFAULT_ADSKEEPER_SITE = "1087913"

export const AD_NETWORK_SCRIPT_URLS = {
  adsense: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || DEFAULT_ADSENSE_CLIENT
  }`,
  adskeeper: `https://jsc.adskeeper.com/site/${process.env.NEXT_PUBLIC_ADSKEEPER_SITE_ID || DEFAULT_ADSKEEPER_SITE}.js`,
} as const

const RESTRICTED_PATHS = [
  "/auth/login",
  "/auth/sign-up",
  "/auth/error",
  "/auth/sign-up-success",
  "/donate",
  "/advertise",
  "/promote",
] as const

const RESTRICTED_PREFIXES = ["/api", "/dashboard", "/payment"] as const

function isExplicitlyDisabled(value?: string | null) {
  if (!value) return false
  return ["0", "false", "off", "no"].includes(value.trim().toLowerCase())
}

export function normalizePathname(pathname?: string | null) {
  const normalized = (pathname || "/").trim()
  return normalized.length > 0 ? normalized.replace(/\/+$/, "") || "/" : "/"
}

export function isPublicContentPath(pathname?: string | null) {
  const normalized = normalizePathname(pathname)

  if (RESTRICTED_PATHS.includes(normalized as (typeof RESTRICTED_PATHS)[number])) {
    return false
  }

  return !RESTRICTED_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))
}

export function getAdRouteState(pathname?: string | null): AdRouteState {
  const normalized = normalizePathname(pathname)
  const publicContent = isPublicContentPath(normalized)
  const adsenseGloballyEnabled = !isExplicitlyDisabled(process.env.NEXT_PUBLIC_ENABLE_ADSENSE)
  const adskeeperGloballyEnabled = !isExplicitlyDisabled(process.env.NEXT_PUBLIC_ENABLE_ADSKEEPER)

  return {
    pathname: normalized,
    publicContent,
    adsenseEnabled: publicContent && adsenseGloballyEnabled,
    adskeeperEnabled: publicContent && adskeeperGloballyEnabled,
  }
}

export type ManagedScriptConfig = {
  id: string
  src: string
  enabled: boolean
  nonce?: string
  crossOrigin?: "anonymous" | "use-credentials"
  dataset?: Record<string, string>
}

export function syncManagedScript({
  id,
  src,
  enabled,
  nonce,
  crossOrigin = "anonymous",
  dataset,
}: ManagedScriptConfig) {
  if (typeof document === "undefined") return

  const existing = document.getElementById(id) as HTMLScriptElement | null

  if (!enabled) {
    existing?.remove()
    return
  }

  if (existing) {
    existing.async = true
    existing.crossOrigin = crossOrigin
    if (nonce) existing.nonce = nonce
    if (dataset) {
      Object.entries(dataset).forEach(([key, value]) => {
        existing.dataset[key] = value
      })
    }
    return
  }

  const script = document.createElement("script")
  script.id = id
  script.async = true
  script.src = src
  script.crossOrigin = crossOrigin
  if (nonce) script.nonce = nonce
  if (dataset) {
    Object.entries(dataset).forEach(([key, value]) => {
      script.dataset[key] = value
    })
  }

  document.head.appendChild(script)
}
