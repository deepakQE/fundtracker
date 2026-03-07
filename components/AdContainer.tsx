"use client"

import { useEffect } from "react"

type AdContainerProps = {
  slot?: string
  format?: "auto" | "fluid" | "rectangle"
  responsive?: boolean
  className?: string
}

export default function AdContainer({
  slot = "1234567890",
  format = "auto",
  responsive = true,
  className = "",
}: AdContainerProps) {
  useEffect(() => {
    try {
      // Only load ads if AdSense script is present
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error("AdSense error:", error)
    }
  }, [])

  // Don't render ads in development
  if (process.env.NODE_ENV === "development") {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500 text-sm font-medium">Ad Placeholder (Development)</p>
        <p className="text-xs text-gray-400 mt-2">Ads will appear here in production</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-0000000000000000"}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  )
}
