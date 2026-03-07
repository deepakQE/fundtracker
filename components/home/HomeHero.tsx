import Link from "next/link"

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-emerald-300 blur-3xl" />
        <div className="absolute top-20 right-8 h-64 w-64 rounded-full bg-teal-300 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">FundTracker</p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            Discover the Most Trusted Charities to Support
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-emerald-50 md:text-xl">
            Compare global fundraising campaigns, verify NGOs, and donate with confidence.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#campaigns"
              className="rounded-xl bg-white px-7 py-3 text-base font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
            >
              Browse Campaigns
            </a>
            <Link
              href="/ngo-rankings"
              className="rounded-xl border border-emerald-100 px-7 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Top NGOs
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">10,000+</p>
              <p className="text-sm text-emerald-50">campaigns tracked</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">1,000+</p>
              <p className="text-sm text-emerald-50">NGOs analyzed</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">INR 1B+</p>
              <p className="text-sm text-emerald-50">donations monitored</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">50+</p>
              <p className="text-sm text-emerald-50">countries supported</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
