import Link from "next/link"

const CATEGORY_ITEMS = [
  {
    key: "healthcare",
    title: "Healthcare",
    description: "Medical care, treatments, and recovery support.",
    icon: "H",
  },
  {
    key: "education",
    title: "Education",
    description: "Scholarships, classrooms, and student support.",
    icon: "E",
  },
  {
    key: "environment",
    title: "Environment",
    description: "Climate action, forests, and sustainability.",
    icon: "N",
  },
  {
    key: "emergency",
    title: "Emergency",
    description: "Rapid response for crises and disasters.",
    icon: "R",
  },
  {
    key: "water",
    title: "Water",
    description: "Clean water and sanitation initiatives.",
    icon: "W",
  },
  {
    key: "hunger",
    title: "Food Security",
    description: "Nutrition and hunger relief for communities.",
    icon: "F",
  },
]

export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Explore Cause Categories</h2>
        <p className="mt-2 text-gray-600">Find campaigns by issue area and start supporting trusted impact.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ITEMS.map((item) => (
          <div key={item.key} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            <Link
              href={`/category/${item.key}`}
              className="mt-5 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              View campaigns
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
