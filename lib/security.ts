import "server-only"

import crypto from "node:crypto"
import { generateSecret, generateURI } from "otplib"
import * as speakeasy from "speakeasy"
import QRCode from "qrcode"
import { createClient } from "@/lib/supabase/server"

const AUTH_ISSUER = "Tuganire News"

function getSecurityKey() {
  const seed = process.env.SECURITY_ENCRYPTION_KEY || process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "tuganire-security-fallback"
  return crypto.createHash("sha256").update(seed).digest()
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", getSecurityKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64url")
}

export function decryptSecret(value: string) {
  const raw = Buffer.from(value, "base64url")
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const payload = raw.subarray(28)
  const decipher = crypto.createDecipheriv("aes-256-gcm", getSecurityKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(payload), decipher.final()]).toString("utf8")
}

export function hashCode(value: string) {
  return crypto.createHash("sha256").update(value.trim().toUpperCase()).digest("hex")
}

export function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const code = crypto.randomBytes(5).toString("hex").toUpperCase()
    return {
      code,
      hash: hashCode(code),
    }
  })
}

export function generateDeviceFingerprint(userAgent?: string | null) {
  const agent = String(userAgent || "").toLowerCase()
  const browser = agent.includes("chrome") ? "Chrome" : agent.includes("safari") ? "Safari" : agent.includes("firefox") ? "Firefox" : agent.includes("edg/") ? "Edge" : "Unknown browser"
  const device = agent.includes("mobile") ? "Mobile" : agent.includes("tablet") || agent.includes("ipad") ? "Tablet" : "Desktop"
  return { browser, device }
}

export function getRequestIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || headers.get("cf-connecting-ip") || null
}

export function getRequestCountry(headers: Headers) {
  return headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "unknown"
}

export async function ensureTwoFactorSetup(userId: string, email?: string | null) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from("two_factor_auth").select("*").eq("user_id", userId).maybeSingle()

  if (existing) {
    const secret = decryptSecret(existing.secret)
    const otpauth = generateURI({ issuer: AUTH_ISSUER, label: email || userId, secret })
    return {
      ...existing,
      secret,
      qrCodeDataUrl: await QRCode.toDataURL(otpauth),
      otpauthUri: otpauth,
      backupCodes: [],
      isFreshSetup: false,
    }
  }

  const secret = generateSecret()
  const backupCodes = generateRecoveryCodes(8)
  const otpauth = generateURI({ issuer: AUTH_ISSUER, label: email || userId, secret })
  const encryptedSecret = encryptSecret(secret)
  const encryptedCodes = backupCodes.map((item) => ({ code_hash: item.hash, used_at: null }))

  const { data: row, error } = await supabase
    .from("two_factor_auth")
    .insert({
      user_id: userId,
      secret: encryptedSecret,
      enabled: false,
      backup_codes: backupCodes.map((item) => item.hash),
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  await supabase.from("recovery_codes").insert(
    encryptedCodes.map((item) => ({
      user_id: userId,
      code_hash: item.code_hash,
      used_at: item.used_at,
    })),
  )

  return {
    ...row,
    secret,
    qrCodeDataUrl: await QRCode.toDataURL(otpauth),
    otpauthUri: otpauth,
    backupCodes: backupCodes.map((item) => item.code),
    isFreshSetup: true,
  }
}

export async function getSecurityOverview(userId: string) {
  const supabase = await createClient()

  const [userSecurity, twoFactor, sessions, activity, notifications] = await Promise.all([
    supabase.from("user_security").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("two_factor_auth").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_sessions").select("*").eq("user_id", userId).order("last_active_at", { ascending: false }).limit(10),
    supabase.from("login_activity").select("*").eq("user_id", userId).order("login_at", { ascending: false }).limit(10),
    supabase.from("security_notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
  ])

  const totpSecret = twoFactor.data?.secret ? decryptSecret(twoFactor.data.secret) : null

  return {
    userSecurity: userSecurity.data || null,
    twoFactor: twoFactor.data
      ? {
          ...twoFactor.data,
          secret: totpSecret,
          enabled: Boolean(twoFactor.data.enabled),
        }
      : null,
    sessions: sessions.data || [],
    activity: activity.data || [],
    notifications: notifications.data || [],
  }
}

export function verifyTotp(secret: string, token: string) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  })
}
