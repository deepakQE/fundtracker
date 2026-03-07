import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import Link from "next/link"
import NewsletterPopup from "@/components/NewsletterPopup"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import ResponsiveNavbar from "@/components/navigation/ResponsiveNavbar"

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
  alternates: {
    canonical: "/",
  },

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
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>

        {/* ===== Structured Data (SEO Boost) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {/* ===== Google AdSense ===== */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}

        {/* ================= NAVBAR ================= */}
        <ResponsiveNavbar />

        {/* ================= PAGE CONTENT ================= */}
        <div className="pb-20 sm:pb-0">
          {children}
          <NewsletterPopup />

        {/* ================= FOOTER ================= */}
        <footer className="bg-gray-900 text-gray-300 mt-32 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">FundTracker</h3>
                <p className="text-sm text-gray-400">
                  Discover and analyze trending fundraising campaigns worldwide.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                  <li><Link href="/trending" className="hover:text-white transition">Trending</Link></li>
                  <li><Link href="/most-funded" className="hover:text-white transition">Most Funded</Link></li>
                  <li><Link href="/ending-soon" className="hover:text-white transition">Ending Soon</Link></li>
                  <li><Link href="/recently-funded" className="hover:text-white transition">Recently Funded</Link></li>
                  <li><Link href="/ngo-rankings" className="hover:text-white transition">Top NGOs</Link></li>
                  <li><Link href="/compare" className="hover:text-white transition">Compare</Link></li>
                  <li><Link href="/analytics" className="hover:text-white transition">Analytics</Link></li>
                  <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                  <li><Link href="/guides" className="hover:text-white transition">Donation Guides</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Help</Link></li>
                  <li><a href="mailto:fundtrackersupport@gmail.com" className="hover:text-white transition">Support Email</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <p className="text-sm text-gray-400 text-center md:text-left">© {new Date().getFullYear()} FundTracker. All rights reserved.</p>
              <p className="text-sm text-gray-400 text-center md:text-right">Made with <span className="text-emerald-500">♥</span> for good causes</p>
            </div>
          </div>
          </footer>
        </div>
      </body>
    </html>
  )
}