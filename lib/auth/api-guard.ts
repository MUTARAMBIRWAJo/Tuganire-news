import { NextResponse } from "next/server"
import { getCurrentUser } from "../auth"
import type { AppUser } from "../types"

type ApiAuthorization =
  | { authorized: true; user: AppUser }
  | { authorized: false; response: NextResponse }

export async function requireApiRoles(roles: readonly string[]): Promise<ApiAuthorization> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "private, no-store" } },
      ),
    }
  }

  if (!roles.includes(user.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: { "Cache-Control": "private, no-store" } },
      ),
    }
  }

  return { authorized: true, user }
}
