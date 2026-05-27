import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const role = user.role?.toLowerCase()
  if (role === "superadmin") redirect("/dashboard/superadmin")
  if (role === "admin") redirect("/dashboard/admin")
  if (role === "reporter") redirect("/dashboard/reporter")
  if (role === "subscriber") redirect("/dashboard/subscriber")
  if (role === "advertiser") redirect("/dashboard/advertiser")
  if (role === "supporter") redirect("/dashboard/supporter")

  redirect("/dashboard/public")
}
