export function appendReferralCode(url?: string): string | undefined {
  if (!url) {
    return undefined
  }

  const referralCode = process.env.NEXT_PUBLIC_REFERRAL_CODE?.trim() || "fundtracker"

  try {
    const parsed = new URL(url)
    if (!parsed.searchParams.has("ref")) {
      parsed.searchParams.set("ref", referralCode)
    }
    return parsed.toString()
  } catch {
    return url
  }
}
