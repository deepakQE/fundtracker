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
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
            
            <Link href="/" className="text-lg md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              FundTracker
            </Link>

            {/* LARGE DESKTOP NAVIGATION */}
            <nav className="hidden xl:flex gap-6 text-sm font-medium">
              <Link href="/" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200">
                Home
              </Link>

              <Link href="/trending" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-semibold">
                🔥 Trending
              </Link>

              <Link href="/analytics" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200">
                📊 Analytics
              </Link>

              <Link href="/ngo-rankings" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200">
                🏆 Top NGOs
              </Link>

              <Link href="/platform-comparison" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200">
                ⚖️ Compare
              </Link>

              <Link href="/about" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200">
                About
              </Link>
            </nav>

            {/* TABLET NAVIGATION (MINIMIZED) */}
            <div className="hidden md:flex xl:hidden items-center gap-3 text-sm font-medium">
              <Link href="/" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200">
                Home
              </Link>
              <Link href="/trending" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-semibold">
                🔥 Trending
              </Link>
              <details className="relative">
                <summary className="list-none cursor-pointer px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-200 transition-colors duration-200">
                  More
                </summary>
                <ul className="absolute right-0 mt-2 z-[60] w-52 p-2 shadow-lg bg-white rounded-lg border border-gray-100">
                  <li><Link href="/analytics" className="block px-3 py-2 text-gray-700 text-sm rounded-md hover:bg-gray-50">📊 Analytics</Link></li>
                  <li><Link href="/ngo-rankings" className="block px-3 py-2 text-gray-700 text-sm rounded-md hover:bg-gray-50">🏆 Top NGOs</Link></li>
                  <li><Link href="/platform-comparison" className="block px-3 py-2 text-gray-700 text-sm rounded-md hover:bg-gray-50">⚖️ Compare</Link></li>
                  <li><Link href="/about" className="block px-3 py-2 text-gray-700 text-sm rounded-md hover:bg-gray-50">About</Link></li>
                </ul>
              </details>
            </div>

            {/* MOBILE MENU */}
            <div className="md:hidden">
              <details className="dropdown dropdown-end">
                <summary className="btn btn-ghost btn-xs md:btn-sm btn-circle text-xl cursor-pointer">☰</summary>
                <ul className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-48 border border-gray-100">
                  <li><Link href="/" className="text-gray-700 text-sm">Home</Link></li>
                  <li><Link href="/trending" className="text-gray-700 text-sm">🔥 Trending</Link></li>
                  <li><Link href="/analytics" className="text-gray-700 text-sm">📊 Analytics</Link></li>
                  <li><Link href="/ngo-rankings" className="text-gray-700 text-sm">🏆 Top NGOs</Link></li>
                  <li><Link href="/platform-comparison" className="text-gray-700 text-sm">⚖️ Compare</Link></li>
                  <li><Link href="/about" className="text-gray-700 text-sm">About</Link></li>
                </ul>
              </details>
            </div>
          </div>
        </header>

        {/* ================= PAGE CONTENT ================= */}
        {children}

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
                  <li><Link href="/analytics" className="hover:text-white transition">Analytics</Link></li>
                  <li><Link href="/ngo-rankings" className="hover:text-white transition">Top NGOs</Link></li>
                  <li><Link href="/platform-comparison" className="hover:text-white transition">Compare Platforms</Link></li>
                  <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition">Help</a></li>
                  <li><a href="#" className="hover:text-white transition">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <p className="text-sm text-gray-400 text-center md:text-left">© {new Date().getFullYear()} FundTracker. All rights reserved.</p>
              <p className="text-sm text-gray-400 text-center md:text-right">Made with <span className="text-emerald-500">♥</span> for good causes</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}