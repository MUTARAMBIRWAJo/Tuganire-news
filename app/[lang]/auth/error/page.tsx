import AuthErrorPage from "@/app/auth/error/page"

export default function LocalizedAuthErrorPage({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  return <AuthErrorPage searchParams={searchParams} />
}
