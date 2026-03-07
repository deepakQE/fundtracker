"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

type NavItem = {
  href: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/trending", label: "Trending" },
  { href: "/most-funded", label: "Most Funded" },
  { href: "/ending-soon", label: "Ending Soon" },
  { href: "/recently-funded", label: "Recently Funded" },
  { href: "/ngo-rankings", label: "Top NGOs" },
  { href: "/compare", label: "Compare" },
  { href: "/blog", label: "Blog" },
  { href: "/guides", label: "Guides" },
]

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-semibold transition ${
        isActive ? "text-emerald-700" : "text-gray-700 hover:text-emerald-600"
      }`}
    >
      {label}
    </Link>
  )
}

function BottomNavIcon({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 inline-flex h-5 w-5 items-center justify-center">{children}</span>
}

export default function ResponsiveNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      if (menuOpen) {
        setMenuOpen(false)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent"
          >
            FundTracker
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:border-emerald-300 hover:text-emerald-600 sm:inline-flex lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="tablet-nav-drawer"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? "X" : "Menu"}
          </button>
        </div>

        <div
          id="tablet-nav-drawer"
          className={`hidden border-t border-gray-100 bg-white shadow-sm transition sm:block lg:hidden ${
            menuOpen ? "max-h-[520px] opacity-100" : "max-h-0 overflow-hidden opacity-0"
          }`}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 py-3 sm:px-6">
            {NAV_ITEMS.map((item) => (
              <NavLink key={`tablet-${item.href}`} href={item.href} label={item.label} onClick={() => setMenuOpen(false)} />
            ))}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white sm:hidden" aria-label="Mobile navigation">
        <div className="grid grid-cols-5">
          <Link href="/" className="flex min-h-[56px] flex-col items-center justify-center text-xs font-semibold text-gray-700 hover:text-emerald-600">
            <BottomNavIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M3 11.5L12 4l9 7.5" />
                <path d="M5 10.5V20h14v-9.5" />
              </svg>
            </BottomNavIcon>
            Home
          </Link>

          <Link href="/trending" className="flex min-h-[56px] flex-col items-center justify-center text-xs font-semibold text-gray-700 hover:text-emerald-600">
            <BottomNavIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 16l5-6 4 4 7-8" />
              </svg>
            </BottomNavIcon>
            Trending
          </Link>

          <Link href="/ngo-rankings" className="flex min-h-[56px] flex-col items-center justify-center text-xs font-semibold text-gray-700 hover:text-emerald-600">
            <BottomNavIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 19h16" />
                <path d="M7 19V9h3v10" />
                <path d="M14 19V5h3v14" />
              </svg>
            </BottomNavIcon>
            Top NGOs
          </Link>

          <Link href="/blog" className="flex min-h-[56px] flex-col items-center justify-center text-xs font-semibold text-gray-700 hover:text-emerald-600">
            <BottomNavIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M5 5h14v14H5z" />
                <path d="M8 9h8" />
                <path d="M8 13h8" />
              </svg>
            </BottomNavIcon>
            Blog
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex min-h-[56px] flex-col items-center justify-center text-xs font-semibold text-gray-700 hover:text-emerald-600"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Close full navigation" : "Open full navigation"}
          >
            <BottomNavIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </BottomNavIcon>
            Menu
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav-drawer"
        className={`fixed inset-0 z-[60] bg-black/55 transition sm:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          className={`ml-auto h-full w-[84%] max-w-sm bg-white p-5 shadow-xl transition-transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <p className="text-base font-bold text-gray-900">Navigate</p>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-200 font-semibold text-gray-700"
              aria-label="Close full navigation"
            >
              X
            </button>
          </div>

          <div className="grid gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={`mobile-${item.href}`} href={item.href} label={item.label} onClick={() => setMenuOpen(false)} />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 -z-10"
          aria-label="Close menu overlay"
        />
      </div>
    </>
  )
}
