import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "FundTracker – Discover Trending Fundraising Campaigns",
    template: "%s | FundTracker",
  },
  description:
    "Explore and analyze trending fundraising campaigns across platforms. Compare funding progress, trust levels, and growth insights.",

  keywords: [
    "fundraising",
    "crowdfunding",
    "donations",
    "campaign tracker",
    "NGO funding",
    "fundraising analytics",
  ],

  openGraph: {
    title: "FundTracker – Trending Fundraising Campaigns",
    description:
      "Track and analyze the most trending crowdfunding campaigns in one place.",
    url: "https://yourdomain.com",
    siteName: "FundTracker",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FundTracker",
    description:
      "Discover trending crowdfunding campaigns and analyze their growth.",
  },

  metadataBase: new URL("http://localhost:3000"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {children}
      </body>
    </html>
  )
}