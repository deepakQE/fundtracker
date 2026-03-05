export const metadata = {
  title: "Fundraising Analytics Tool | FundTracker",
  description:
    "FundTracker is a fundraising analytics tool that helps donors, NGOs, and researchers analyze crowdfunding campaign performance and growth trends.",
};

import Link from "next/link"

export default function FundraisingAnalyticsTool() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* HERO */}
      <section className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Fundraising Analytics Tool
          </h1>
          <p className="text-xl text-teal-100">
            Analyze, compare, and track crowdfunding performance with real-time insights
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* INTRO */}
        <section className="mb-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use Our Analytics Tool?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            FundTracker is a modern fundraising analytics tool designed to help
            users discover, compare, and analyze crowdfunding campaigns. It
            provides insights into campaign growth, donation trends, and funding
            performance across platforms.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Evaluating fundraising campaigns manually can be time-consuming.
            Our analytics tool simplifies the process by presenting structured 
            campaign data, growth indicators, and performance comparisons in one 
            intuitive dashboard.
          </p>
        </section>

        {/* KEY FEATURES */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "📈",
                title: "Campaign Growth Tracking",
                desc: "Monitor fundraising progress in real-time with detailed trend analysis and historical data"
              },
              {
                icon: "💰",
                title: "Donation Progress Monitoring",
                desc: "Track how campaigns are performing towards their goals with visual metrics"
              },
              {
                icon: "🔒",
                title: "Trust & Transparency Insights",
                desc: "Get clear visibility into campaign legitimacy and funding patterns"
              },
              {
                icon: "📊",
                title: "Performance Metrics",
                desc: "Compare structured fundraising data across campaigns and categories"
              },
              {
                icon: "🌍",
                title: "Multi-Platform Support",
                desc: "Analyze campaigns from GlobalGiving, local platforms, and more in one place"
              },
              {
                icon: "⚡",
                title: "Real-Time Updates",
                desc: "Stay updated with live campaign data as donations come in"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-16 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-xl border-2 border-emerald-200">
          <h2 className="text-3xl font-bold text-emerald-900 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { num: "1", title: "Search", desc: "Find campaigns by category or keywords" },
              { num: "2", title: "Compare", desc: "Analyze performance metrics side-by-side" },
              { num: "3", title: "Analyze", desc: "Review trends and funding patterns" },
              { num: "4", title: "Decide", desc: "Make informed donation decisions" }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white p-4 rounded-lg border border-emerald-300 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-emerald-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to analyze campaigns?</h2>
          <p className="text-gray-700 mb-6">Start exploring our comprehensive fundraising analytics platform today.</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Start Analyzing Now
          </Link>
        </section>

      </div>
    </main>
  );
}