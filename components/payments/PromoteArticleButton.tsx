import Link from "next/link"
import { Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PromoteArticleButtonProps {
  articleId: string
  articleTitle: string
  className?: string
}

export default function PromoteArticleButton({ articleId, articleTitle, className = "" }: PromoteArticleButtonProps) {
  const href = `/promote?articleId=${encodeURIComponent(articleId)}&articleTitle=${encodeURIComponent(articleTitle)}`

  return (
    <Button asChild className={className}>
      <Link href={href}>
        <Rocket className="mr-2 size-4" />
        Boost Article
      </Link>
    </Button>
  )
}
