import HomePage from "@/app/page"

export default async function LanguageHomePage({
  params,
}: {
  params: Promise<{ lang?: string }>
}) {
  return <HomePage params={params} />
}
