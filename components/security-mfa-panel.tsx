"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, ShieldCheck, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"

type FactorRecord = {
  id: string
  type?: "totp" | "phone" | "webauthn"
  factor_type?: "totp" | "phone" | "webauthn"
  status?: "verified" | "unverified"
  friendly_name?: string
}

type EnrollmentState = {
  id: string
  challengeId?: string
  qrCode: string
  secret: string
  uri: string
}

export function SecurityMfaPanel() {
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [enrollment, setEnrollment] = useState<EnrollmentState | null>(null)
  const [removalFactorId, setRemovalFactorId] = useState<string | null>(null)
  const [removalChallengeId, setRemovalChallengeId] = useState<string | null>(null)
  const [removalCode, setRemovalCode] = useState("")
  const [factors, setFactors] = useState<FactorRecord[]>([])
  const [aal, setAal] = useState<string | null>(null)

  const verifiedFactors = useMemo(
    () => factors.filter((factor) => factor.status === "verified"),
    [factors]
  )

  const refreshFactors = async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: factorsError } = await supabase.auth.mfa.listFactors()

    if (factorsError) {
      setError("Unable to load MFA status right now.")
      setIsLoading(false)
      return
    }

    const allFactors = ((data?.all as FactorRecord[] | undefined) ?? [])
    setFactors(allFactors)

    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (!aalError) {
      setAal(aalData?.currentLevel ?? null)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    void refreshFactors()
  }, [])

  const startEnrollment = async () => {
    setIsBusy(true)
    setError(null)
    setSuccess(null)

    const { data: factorData, error: factorListError } = await supabase.auth.mfa.listFactors()
    if (factorListError) {
      setError("Unable to check your existing authenticator setup.")
      setIsBusy(false)
      return
    }

    const pendingFactors = (factorData?.all ?? []).filter((factor) => {
      return factor.factor_type === "totp" && factor.status === "unverified"
    })

    for (const factor of pendingFactors) {
      const { error: cleanupError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
      if (cleanupError) {
        setError("Unable to clear the previous authenticator setup. Please try again.")
        setIsBusy(false)
        return
      }
    }

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Tuganire TNT",
      issuer: "Tuganire TNT",
    })

    if (enrollError || !data || data.type !== "totp") {
      setError("Unable to start the authenticator setup flow.")
      setIsBusy(false)
      return
    }

    setEnrollment({
      id: data.id,
      qrCode: data.totp?.qr_code ?? "",
      secret: data.totp?.secret ?? "",
      uri: data.totp?.uri ?? "",
    })
    setIsBusy(false)
    await refreshFactors()
  }

  const verifyEnrollment = async () => {
    if (!enrollment || code.trim().length < 6) {
      setError("Enter the 6-digit code from your authenticator app.")
      return
    }

    setIsBusy(true)
    setError(null)
    setSuccess(null)

    let challengeId = enrollment.challengeId
    if (!challengeId) {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollment.id,
      })

      if (challengeError || !challengeData?.id) {
        setError("The authenticator challenge could not be created.")
        setIsBusy(false)
        return
      }

      challengeId = challengeData.id
      setEnrollment({ ...enrollment, challengeId })
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollment.id,
      challengeId,
      code: code.trim(),
    })

    if (verifyError) {
      setError("The verification code was invalid or expired. Please try again.")
      setIsBusy(false)
      return
    }

    setCode("")
    setEnrollment(null)
    setSuccess("Two-factor authentication is now enabled for this account.")
    setIsBusy(false)
    await refreshFactors()
  }

  const beginFactorRemoval = async (factorId: string) => {
    setIsBusy(true)
    setError(null)
    setSuccess(null)

    const { data, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })

    if (challengeError || !data?.id) {
      setError("Unable to start identity verification for MFA removal.")
      setIsBusy(false)
      return
    }

    setRemovalFactorId(factorId)
    setRemovalChallengeId(data.id)
    setRemovalCode("")
    setIsBusy(false)
  }

  const cancelEnrollment = async () => {
    if (!enrollment) return

    setIsBusy(true)
    setError(null)

    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: enrollment.id })
    if (unenrollError) {
      setError("Unable to cancel authenticator setup. The pending factor was not removed.")
      setIsBusy(false)
      return
    }

    setEnrollment(null)
    setCode("")
    setIsBusy(false)
    await refreshFactors()
  }

  const removeFactor = async () => {
    if (!removalFactorId || !removalChallengeId || removalCode.length !== 6) return

    setIsBusy(true)
    setError(null)
    setSuccess(null)

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: removalFactorId,
      challengeId: removalChallengeId,
      code: removalCode,
    })

    if (verifyError) {
      setRemovalCode("")
      setError("The verification code was invalid. If the challenge has expired, cancel and start again.")
      setIsBusy(false)
      return
    }

    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalError || aalData?.currentLevel !== "aal2") {
      setRemovalCode("")
      setError("Identity verification did not reach AAL2. The MFA factor was not removed.")
      setIsBusy(false)
      return
    }

    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: removalFactorId })
    if (unenrollError) {
      setError("Unable to remove the MFA factor at the moment.")
      setIsBusy(false)
      return
    }

    setRemovalFactorId(null)
    setRemovalChallengeId(null)
    setRemovalCode("")
    setSuccess("Two-factor authentication has been removed from this account.")
    setIsBusy(false)
    await refreshFactors()
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Loading authentication security status…</p>
      </div>
    )
  }

  const hasVerifiedFactor = verifiedFactors.length > 0
  const qrCodeSource = enrollment?.qrCode
    ? enrollment.qrCode.startsWith("data:")
      ? enrollment.qrCode
      : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(enrollment.qrCode)}`
    : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Two-factor authentication</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {hasVerifiedFactor ? "Authenticator app enabled" : "Not enabled"}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          {aal ? `AAL${aal === "aal2" ? 2 : 1}` : "Supabase MFA"}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {hasVerifiedFactor ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <Smartphone className="h-4 w-4 text-slate-600" />
            {verifiedFactors[0]?.friendly_name ?? "Authenticator app"}
          </div>

          <p className="text-sm text-slate-600">
            Recovery codes are not supported. If you lose access to your authenticator, contact an administrator through a verified support channel.
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isBusy}
            onClick={() => beginFactorRemoval(verifiedFactors[0].id)}
          >
            Disable MFA
          </Button>
          {removalFactorId && (
            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm text-slate-700">Enter a current code from the authenticator app to confirm removal.</p>
              <Input
                id="mfa-removal-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={removalCode}
                onChange={(event) => setRemovalCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={isBusy}
                  onClick={() => {
                    setRemovalFactorId(null)
                    setRemovalChallengeId(null)
                    setRemovalCode("")
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" className="flex-1" disabled={isBusy || removalCode.length !== 6} onClick={removeFactor}>
                  {isBusy ? "Verifying…" : "Verify and disable"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : enrollment ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-600">
            Scan the code below with your authenticator app, then enter the 6-digit verification code.
          </p>

          {qrCodeSource && (
            <div className="flex justify-center rounded-lg border border-slate-200 bg-slate-50 p-3">
              <img
                src={qrCodeSource}
                alt="Authenticator QR code"
                className="h-44 w-44 rounded-md bg-white p-2"
              />
            </div>
          )}

          {enrollment.secret && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="font-medium text-slate-700">Manual key:</span> {enrollment.secret}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="mfa-code" className="text-sm font-medium text-slate-700">
              Verification code
            </label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={cancelEnrollment} disabled={isBusy}>
              Cancel
            </Button>
            <Button type="button" className="flex-1" onClick={verifyEnrollment} disabled={isBusy || code.length < 6}>
              {isBusy ? "Verifying…" : "Verify"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-600">
            Use the official Supabase Auth MFA flow to secure your account with a TOTP authenticator app.
          </p>

          <Button type="button" className="w-full" onClick={startEnrollment} disabled={isBusy}>
            {isBusy ? "Setting up…" : "Set up authenticator app"}
          </Button>
        </div>
      )}
    </div>
  )
}
