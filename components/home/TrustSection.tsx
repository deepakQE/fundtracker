import Link from "next/link"

const TRUST_ITEMS = [
  {
    title: "Verified NGO data",
    description: "Campaigns are connected to NGO profiles so donors can evaluate source credibility.",
  },
  {
    title: "Transparent campaign metrics",
    description: "Funding progress, trust indicators, and goal tracking are shown clearly on each card.",
  },
  {
    title: "Independent comparison tools",
    description: "Compare multiple campaigns side by side before deciding where to contribute.",
  },
]

export default function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-gray-800 p-8 text-white shadow-xl md:p-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Trust Layer</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Why Trust FundTracker</h2>
          </div>
          <Link
            href="/guides/how-fundtracker-calculates-trust-scores"
            className="text-sm font-semibold text-emerald-300 underline-offset-4 hover:underline"
          >
            How scoring works
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-200">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
