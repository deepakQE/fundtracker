const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

export function isValidMoneyValue(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function toSafeNumber(value: number | null | undefined): number {
  return isValidMoneyValue(value) ? value : 0
}

export function formatInrCurrency(
  value: number | null | undefined,
  fallback = "Data pending verification"
): string {
  if (!isValidMoneyValue(value)) {
    return fallback
  }

  return INR_FORMATTER.format(value)
}

export function formatCompactCurrency(
  value: number | null | undefined,
  fallback = "Data pending verification"
): string {
  if (!isValidMoneyValue(value)) {
    return fallback
  }

  const absValue = Math.abs(value)

  if (absValue >= 1_00_00_00_000) {
    // 1 billion+
    return `₹${(value / 1_00_00_00_000).toFixed(1)}B+`
  }
  
  if (absValue >= 1_00_00_000) {
    // 1 crore+ = 10 million
    return `₹${(value / 1_00_00_000).toFixed(1)}Cr+`
  }
  
  if (absValue >= 1_00_000) {
    // 1 lakh+ = 100K
    return `₹${(value / 1_00_000).toFixed(1)}L+`
  }
  
  if (absValue >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K+`
  }

  return INR_FORMATTER.format(value)
}

export function formatInrRange(
  amount: number | null | undefined,
  goal: number | null | undefined,
  fallback = "Data pending verification"
): string {
  if (!isValidMoneyValue(amount) || !isValidMoneyValue(goal)) {
    return fallback
  }

  return `${INR_FORMATTER.format(amount)} / ${INR_FORMATTER.format(goal)}`
}

export function calculateProgress(
  amount: number | null | undefined,
  goal: number | null | undefined
): number {
  const safeAmount = toSafeNumber(amount)
  const safeGoal = toSafeNumber(goal)

  if (safeGoal <= 0) {
    return 0
  }

  return (safeAmount / safeGoal) * 100
}
