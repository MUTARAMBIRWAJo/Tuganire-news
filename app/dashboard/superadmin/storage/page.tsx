import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/auth/guards"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database, Upload, HardDrive, Trash2, RefreshCw } from "lucide-react"
import { revalidatePath } from "next/cache"

export default async function SuperAdminStoragePage() {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">
                Service role key is required to manage storage. Please set SUPABASE_SERVICE_ROLE_KEY.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const supabase = createServiceClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // List all buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  // Get storage usage (approximate)
  let totalSize = 0
  let fileCount = 0
  if (buckets) {
    for (const bucket of buckets) {
      try {
        const { data: files } = await supabase.storage.from(bucket.name).list("", {
          limit: 1000,
          sortBy: { column: "created_at", order: "desc" },
        })
        if (files) {
          fileCount += files.length
          // Note: file size is not directly available in list, this is approximate
        }
      } catch (e) {
        // Ignore errors for individual buckets
      }
    }
  }

  async function createBucket(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const name = String(formData.get("name") || "").trim()
    const isPublic = String(formData.get("public")) === "true"
    
    if (!name) return

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !serviceKey) return

    const supabase = createServiceClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await supabase.storage.createBucket(name, {
      public: isPublic,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
    })

    if (error) {
      console.error("Failed to create bucket:", error)
    }

    revalidatePath("/dashboard/superadmin/storage")
  }

  async function deleteBucket(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const name = String(formData.get("name") || "").trim()
    if (!name) return

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !serviceKey) return

    const supabase = createServiceClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // First, try to delete all files in the bucket
    const { data: files } = await supabase.storage.from(name).list("", { limit: 1000 })
    
    if (files && files.length > 0) {
      const filePaths = files.map((f) => f.name)
      await supabase.storage.from(name).remove(filePaths)
    }

    // Then delete the bucket
    const { error } = await supabase.storage.deleteBucket(name)

    if (error) {
      console.error("Failed to delete bucket:", error)
    }

    revalidatePath("/dashboard/superadmin/storage")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Storage Management</h1>
          <p className="text-slate-600 mt-2">Manage Supabase storage buckets and files</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Buckets</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buckets?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fileCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSize > 0 ? `${(totalSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Bucket */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Bucket</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createBucket} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="name">Bucket Name</Label>
                <Input id="name" name="name" placeholder="bucket-name" required />
              </div>
              <div>
                <Label htmlFor="public">Public Access</Label>
                <Input id="public" name="public" placeholder="true | false" defaultValue="true" />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Create Bucket
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Buckets List */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            {bucketsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                Error loading buckets: {bucketsError.message}
              </div>
            )}

            {buckets && buckets.length > 0 ? (
              <div className="space-y-3">
                {buckets.map((bucket) => (
                  <div
                    key={bucket.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <HardDrive className="h-5 w-5 text-slate-400" />
                        <div>
                          <h3 className="font-semibold text-slate-800">{bucket.name}</h3>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <span className={`px-2 py-1 rounded ${
                              bucket.public ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}>
                              {bucket.public ? "Public" : "Private"}
                            </span>
                            <span>Created: {new Date(bucket.created_at).toLocaleDateString()}</span>
                            {bucket.file_size_limit && (
                              <span>Max size: {(bucket.file_size_limit / 1024 / 1024).toFixed(0)}MB</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <form action={deleteBucket}>
                      <input type="hidden" name="name" value={bucket.name} />
                      <Button size="sm" variant="destructive" type="submit">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600">
                <Database className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                <p>No buckets found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

