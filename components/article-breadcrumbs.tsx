import Link from "next/link"
import { categoryHref } from "@/lib/category-utils"
import { categoryLabel, t, type Locale } from "@/lib/i18n"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface ArticleBreadcrumbsProps {
  categoryName?: string | null
  categorySlug?: string | null
  articleTitle: string
  locale?: Locale
}

export default function ArticleBreadcrumbs({
  categoryName,
  categorySlug,
  articleTitle,
  locale = "en",
}: ArticleBreadcrumbsProps) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${locale}`}>{t("home", locale)}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${locale}/articles`}>{t("articles", locale)}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {categoryName && categorySlug && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${locale}${categoryHref(categorySlug || categoryName)}`}>{categoryLabel({ name: categoryName, slug: categorySlug }, locale)}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{articleTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
