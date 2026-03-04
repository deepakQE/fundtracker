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
  fallback = "Data unavailable"
): string {
  if (!isValidMoneyValue(value)) {
    return fallback
  }

  return INR_FORMATTER.format(value)
}

export function formatInrRange(
  amount: number | null | undefined,
  goal: number | null | undefined,
  fallback = "Data unavailable"
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
