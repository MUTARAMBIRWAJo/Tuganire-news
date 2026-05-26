import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User } from "lucide-react"
import type { Article } from "@/lib/types"

interface FeaturedHeroProps {
  articles: Article[]
}

export function FeaturedHero({ articles }: FeaturedHeroProps) {
  if (!articles || articles.length === 0) return null

  const mainArticle = articles[0]
  const sideArticles = articles.slice(1, 3)

  return (
    <section className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Featured Article */}
        <div className="lg:col-span-2 relative h-[500px] lg:h-[600px] rounded-lg overflow-hidden group">
          {mainArticle.featured_image && (
            <Image
              src={mainArticle.featured_image}
              alt={mainArticle.title}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 text-white">
            {mainArticle.category && (
              <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold uppercase tracking-wide rounded-full mb-4">
                {mainArticle.category.name}
              </span>
            )}
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 line-clamp-3">
              <Link href={`/articles/${mainArticle.slug}`} className="hover:underline">
                {mainArticle.title}
              </Link>
            </h1>
            {mainArticle.excerpt && (
              <p className="text-lg lg:text-xl text-gray-200 mb-6 line-clamp-2">{mainArticle.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
              {mainArticle.author && (
                <span className="flex items-center gap-2">
                  {mainArticle.author.avatar_url ? (
                    <Image
                      src={mainArticle.author.avatar_url}
                          alt={mainArticle.author.full_name || "Author"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  {mainArticle.author.full_name || "Anonymous"}
                </span>
              )}
              {mainArticle.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(mainArticle.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              {mainArticle.reading_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {mainArticle.reading_time} min read
                </span>
              )}
            </div>
            <Button size="lg" asChild className="bg-white text-gray-900 hover:bg-gray-100">
              <Link href={`/articles/${mainArticle.slug}`}>Read Full Story →</Link>
            </Button>
          </div>
        </div>

        {/* Side Featured Articles */}
        {sideArticles.length > 0 && (
          <div className="flex flex-col gap-4">
            {sideArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="relative h-[290px] rounded-lg overflow-hidden group"
              >
                {article.featured_image && (
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  {article.category && (
                    <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-semibold uppercase rounded mb-2">
                      {article.category.name}
                    </span>
                  )}
                  <h3 className="text-lg font-bold line-clamp-2 group-hover:underline">{article.title}</h3>
                  {article.published_at && (
                    <p className="text-xs text-gray-300 mt-2">
                      {new Date(article.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

