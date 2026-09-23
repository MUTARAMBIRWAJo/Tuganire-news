import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !["admin", "superadmin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bucket, public: isPublic } = await req.json()
    if (!bucket) {
      return NextResponse.json({ error: "bucket is required" }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url) {
      return NextResponse.json(
        { error: "Server is missing Supabase URL" },
        { status: 500 }
      )
    }

    if (!serviceKey) {
      return NextResponse.json(
        { error: "Server is missing Supabase service role key. Please set SUPABASE_SERVICE_ROLE_KEY environment variable." },
        { status: 500 }
      )
    }

    const admin = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // First, check if bucket exists
    const { data: buckets, error: listErr } = await admin.storage.listBuckets()
    
    if (listErr) {
      console.error("Error listing buckets:", listErr)
      return NextResponse.json({ error: `Failed to list buckets: ${listErr.message}` }, { status: 500 })
    }

    const existingBucket = buckets?.find((b) => b.name === bucket)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
    ]
    
    if (existingBucket) {
      // Bucket exists, update it if needed
      const { error: updateErr } = await admin.storage.updateBucket(bucket, {
        public: !!isPublic,
        fileSizeLimit: 100 * 1024 * 1024,
        allowedMimeTypes,
      })
      if (updateErr) {
        // If it failed to update and bucket is not public while we requested public, surface an error
        const currentlyPublic = (existingBucket as any).public === true
        if (isPublic && !currentlyPublic) {
          return NextResponse.json({ ok: false, error: `Bucket '${bucket}' exists but could not be set to public: ${updateErr.message}` }, { status: 500 })
        }
        console.warn("Failed to update bucket:", updateErr)
      }
      // Re-fetch bucket details to ensure flag
      const { data: bucketsAfter } = await admin.storage.listBuckets()
      const finalBucket = bucketsAfter?.find((b) => b.name === bucket)
      return NextResponse.json({ ok: true, created: false, data: finalBucket || existingBucket })
    }

    // Bucket doesn't exist, create it
    const { data: createData, error: createErr } = await admin.storage.createBucket(bucket, {
      public: !!isPublic,
      fileSizeLimit: 100 * 1024 * 1024, // 100MB to allow larger videos
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
        "video/mp4",
        "video/webm",
      ],
    })

    if (createErr) {
      // Check if it's an "already exists" error (might have been created between check and create)
      const errorMessage = createErr.message?.toLowerCase() || ""
      const exists = errorMessage.includes("already exists") ||
                     errorMessage.includes("duplicate") ||
                     errorMessage.includes("409") ||
                     (createErr as any).statusCode === 409
      
      if (exists) {
        // Bucket was created between our check and create, that's fine
        return NextResponse.json({ ok: true, created: false, data: null })
        }
      
      console.error("Error creating bucket:", createErr)
      return NextResponse.json({ error: `Failed to create bucket: ${createErr.message || "Unknown error"}` }, { status: 500 })
        }

    return NextResponse.json({ ok: true, created: true, data: createData || null })
  } catch (e: any) {
    console.error("Unexpected error in ensure-bucket:", e)
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
}
