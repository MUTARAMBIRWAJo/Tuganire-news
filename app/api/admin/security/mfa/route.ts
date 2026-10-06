import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

import { getCurrentUser } from "@/lib/auth"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null

  return createServiceClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function requireSuperadmin() {
  const user = await getCurrentUser()
  return user?.role === "superadmin" ? user : null
}

export async function GET() {
  if (!(await requireSuperadmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server MFA administration is not configured" }, { status: 503 })
  }

  const [{ data: appUsers, error: appUsersError }, { data: authUsers, error: authUsersError }] = await Promise.all([
    admin.from("app_users").select("id, display_name, role, is_approved").order("display_name"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  if (appUsersError || authUsersError) {
    return NextResponse.json({ error: "Unable to load account security status" }, { status: 500 })
  }

  const authUserMap = new Map((authUsers?.users ?? []).map((user) => [user.id, user]))
  const users = []

  for (const appUser of appUsers ?? []) {
    const authUser = authUserMap.get(appUser.id)
    if (!authUser) continue

    const { data: factorData, error: factorError } = await admin.auth.admin.mfa.listFactors({ userId: appUser.id })
    if (factorError) {
      return NextResponse.json({ error: "Unable to load MFA factors" }, { status: 500 })
    }

    const factors = factorData?.factors ?? []
    users.push({
      id: appUser.id,
      displayName: appUser.display_name,
      email: authUser.email,
      role: appUser.role,
      isApproved: appUser.is_approved,
      mfaRequired: authUser.app_metadata?.mfa_required === true,
      verifiedFactorCount: factors.filter((factor) => factor.status === "verified").length,
      pendingFactorCount: factors.filter((factor) => factor.status === "unverified").length,
    })
  }

  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  if (!(await requireSuperadmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server MFA administration is not configured" }, { status: 503 })
  }

  const body = await request.json().catch(() => null) as { action?: string; userId?: string } | null
  if (!body?.userId || !["require", "disable"].includes(body.action ?? "")) {
    return NextResponse.json({ error: "A valid userId and action are required" }, { status: 400 })
  }

  const { data: target, error: targetError } = await admin.auth.admin.getUserById(body.userId)
  if (targetError || !target.user) {
    return NextResponse.json({ error: "Target account was not found" }, { status: 404 })
  }

  const currentMetadata = target.user.app_metadata ?? {}
  const requiresMfa = body.action === "require"
  const { error: metadataError } = await admin.auth.admin.updateUserById(body.userId, {
    app_metadata: { ...currentMetadata, mfa_required: requiresMfa },
  })

  if (metadataError) {
    return NextResponse.json({ error: "Unable to update the MFA requirement" }, { status: 500 })
  }

  if (!requiresMfa) {
    const { data: factorData, error: factorError } = await admin.auth.admin.mfa.listFactors({ userId: body.userId })
    if (factorError) {
      return NextResponse.json({ error: "MFA requirement cleared, but factors could not be listed" }, { status: 500 })
    }

    for (const factor of factorData?.factors ?? []) {
      const { error: deleteError } = await admin.auth.admin.mfa.deleteFactor({
        userId: body.userId,
        id: factor.id,
      })
      if (deleteError) {
        return NextResponse.json({ error: "MFA requirement cleared, but a factor could not be removed" }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ ok: true, mfaRequired: requiresMfa })
}
