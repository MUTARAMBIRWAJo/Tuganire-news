import ArticlePage from "@/app/articles/[slug]/page"

export default async function LanguageArticlePage({
  params,
}: {
  params: Promise<{ lang?: string; slug: string }>
}) {
  const resolved = await params
  return ArticlePage({
    params: Promise.resolve({
      slug: resolved.slug,
      lang: resolved.lang,
    }),
  })
}
