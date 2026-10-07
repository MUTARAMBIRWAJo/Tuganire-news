import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { EditorialForm, type EditorialFormType } from "@/components/editorial/editorial-form"

const validTypes = new Set<EditorialFormType>(["magazine", "research", "story", "history"])

export default async function EditorialCreatePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const resolved = await params
  const type = (resolved.type || "story") as EditorialFormType

  if (!validTypes.has(type)) {
    redirect("/dashboard/editorial")
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Editorial</p>
            <h1 className="text-3xl font-bold capitalize text-slate-950">Create {type}</h1>
          </div>
        </div>

        <EditorialForm contentType={type} authorId={user.id} submitLabel={`Create ${type}`} />
      </div>
    </div>
  )
}
