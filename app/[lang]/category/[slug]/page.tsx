import CategoryPage from "@/app/category/[slug]/page"

export default async function LanguageCategoryPage({
  params,
}: {
  params: Promise<{ lang?: string; slug: string }>
}) {
  const resolved = await params
  return CategoryPage({
    params: Promise.resolve({
      slug: resolved.slug,
      lang: resolved.lang,
    }) as any,
  })
}
