export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return
  }

  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag !== "function") {
    return
  }

  gtag("event", eventName, params || {})
}
