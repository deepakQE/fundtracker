import Link from "next/link";

export const metadata = {
  title: "About FundTracker",
  description:
    "Learn what FundTracker is, how it helps users analyze fundraising campaigns, and why it is useful for donors, NGOs, and researchers.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* HERO */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About FundTracker
          </h1>
          <p className="text-xl text-emerald-100">
            Empowering smarter donations through data-driven insights
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* INTRO */}
        <section className="mb-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is FundTracker?</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            FundTracker is a fundraising analytics platform that helps users
            discover and analyze trending crowdfunding campaigns in one place.
            Instead of manually searching across multiple platforms, FundTracker
            provides a centralized view of campaign progress, growth trends,
            and funding insights.
          </p>
        </section>

        {/* PROBLEM */}
        <section className="mb-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            The Problem We Solve
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Many donors and organizations struggle to evaluate fundraising
            campaigns efficiently. Scattered data, lack of transparency, and
            time-consuming research make it difficult to make informed donation decisions.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🔍", title: "Information Overload", desc: "Campaigns spread across multiple platforms" },
              { icon: "⏱️", title: "Time Consuming", desc: "Manual research takes hours" },
              { icon: "❓", title: "Lack of Insight", desc: "No centralized performance metrics" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHO BENEFITS */}
        <section className="mb-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Who Benefits From FundTracker?
          </h2>
          <ul className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "💝", title: "Donors", desc: "Support high-impact campaigns with confidence" },
              { icon: "🏢", title: "NGOs", desc: "Analyze crowdfunding performance trends" },
              { icon: "📊", title: "Researchers", desc: "Study fundraising growth patterns" },
              { icon: "🎓", title: "Students", desc: "Explore crowdfunding data analytics" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </ul>
        </section>

        {/* MISSION */}
        <section className="mb-16 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-xl border-2 border-emerald-200">
          <h2 className="text-3xl font-bold text-emerald-900 mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-emerald-800 leading-relaxed mb-6">
            Our mission is to improve transparency in crowdfunding by making
            fundraising data accessible, structured, and easy to analyze.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {["Accessibility", "Transparency", "Empowerment"].map((value, i) => (
              <div key={i} className="bg-white p-4 rounded-lg text-center border border-emerald-200">
                <p className="font-bold text-emerald-600">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to make a difference?</h2>
          <p className="text-gray-700 mb-6">Explore our analytics tool and discover meaningful campaigns today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Browse Campaigns
            </Link>
            <Link
              href="/fundraising-analytics-tool"
              className="px-8 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              Analytics Tool
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}