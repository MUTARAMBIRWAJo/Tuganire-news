import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle } from "lucide-react"
import { getLocaleFromPath, t } from "@/lib/i18n"

export default function SignUpSuccessPage() {
  const locale = getLocaleFromPath()
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Image
              src="/placeholder-logo.png"
              alt={t("brand", locale)}
              width={48}
              height={48}
              className="mx-auto h-12 w-12 mb-2"
              priority
            />
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">{t("checkEmail", locale)}</CardTitle>
            <CardDescription>{t("confirmationSent", locale)}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              {t("confirmationDetails", locale)}
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">{t("backToLogin", locale)}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
