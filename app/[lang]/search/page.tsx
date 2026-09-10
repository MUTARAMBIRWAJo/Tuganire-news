import SearchPage from "@/app/search/page"

export default async function LanguageSearchPage({
  params,
}: {
  params: Promise<{ lang?: string }> | { lang?: string }
}) {
  return <SearchPage lang={typeof params === 'object' && params && 'then' in params ? undefined : params?.lang} />
}
