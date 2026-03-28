import Image from "next/image"
import Link from "next/link"
import { Camera, MessageCircle } from "lucide-react"

interface PhotoGalleryItem {
  id: string
  slug: string
  title: string
  featured_image: string | null
  published_at: string | null
  views_count?: number | null
  comments_count?: number | null
  category?: { name: string; slug: string } | null
}

interface PhotoGalleryProps {
  items: PhotoGalleryItem[]
  title?: string
}

export default function PhotoGallery({ items, title = "Photo Gallery" }: PhotoGalleryProps) {
  if (!items || items.length === 0) return null

  // Filter items that have images
  const itemsWithImages = items.filter(item => item.featured_image)

  if (itemsWithImages.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Link 
          href="/articles?sort=published_at_desc" 
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          View All
        </Link>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {itemsWithImages.slice(0, 8).map((item, index) => (
          <Link
            key={item.id}
            href={`/articles/${item.slug}`}
            className="group relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-[4/3] hover:shadow-xl transition-all duration-300"
          >
            {item.featured_image && (
              <Image
                src={item.featured_image}
                alt={item.title}
                fill
                className="w-full h-full object-cover object-center rounded-lg"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.title}</h3>
                <div className="flex items-center gap-3 text-xs text-white/90">
                  {/* Views removed for public */}
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {item.comments_count ?? 0}
                  </span>
                </div>
              </div>
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                Featured
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

