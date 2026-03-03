import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Link from "next/link"

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
    "fundraising analytics tool",
    "crowdfunding campaign tracker",
    "donation tracking platform",
    "NGO funding analytics",
    "fundraising insights",
  ],

  metadataBase: new URL("https://fundtracker.me"),

  verification: {
    google: "Ll3ak7r1uzXGF1E6QoNZIiatW-EiX99wwf2wTj_cG",
  },

  openGraph: {
    title: "FundTracker – Trending Fundraising Campaigns",
    description:
      "Track and analyze the most trending crowdfunding campaigns in one place.",
    url: "https://fundtracker.me",
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FundTracker",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "FundTracker is a fundraising analytics tool that helps users analyze and compare crowdfunding campaigns.",
    url: "https://fundtracker.me",
    creator: {
      "@type": "Person",
      name: "Deepak",
    },
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {/* ===== Structured Data (SEO Boost) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {/* ================= NAVBAR ================= */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            
            <Link href="/" className="text-2xl font-bold text-emerald-600">
              FundTracker
            </Link>

            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-emerald-600 transition">
                Home
              </Link>

              <Link href="/about" className="hover:text-emerald-600 transition">
                About
              </Link>

              <Link href="/admin" className="hover:text-emerald-600 transition">
                Admin
              </Link>
            </nav>
          </div>
        </header>

        {/* ================= PAGE CONTENT ================= */}
        {children}

        {/* ================= FOOTER ================= */}
        <footer className="bg-white border-t mt-20">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} FundTracker. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  )
}