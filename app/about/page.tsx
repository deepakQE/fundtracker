import Link from "next/link";
export const metadata = {
  title: "About FundTracker",
  description:
    "Learn what FundTracker is, how it helps users analyze fundraising campaigns, and why it is useful for donors, NGOs, and researchers.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-emerald-600 mb-8">
        About FundTracker
      </h1>

      <p className="mb-6 text-lg text-gray-700">
        FundTracker is a fundraising analytics platform that helps users
        discover and analyze trending crowdfunding campaigns in one place.
        Instead of manually searching across multiple platforms, FundTracker
        provides a centralized view of campaign progress, growth trends,
        and funding insights.
      </p>
      <p className="mt-6 text-gray-700">
            If you're looking for a dedicated 
            <Link 
                href="/fundraising-analytics-tool"
                className="text-emerald-600 font-semibold hover:underline ml-1"
            >
                fundraising analytics tool
            </Link>, 
            FundTracker provides structured insights to evaluate campaign performance.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        What Problem Does FundTracker Solve?
      </h2>

      <p className="mb-6 text-gray-700">
        Many donors and organizations struggle to evaluate fundraising
        campaigns efficiently. FundTracker simplifies campaign comparison by
        tracking donation progress, campaign performance, and engagement
        patterns in a structured and easy-to-understand format.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Who Can Benefit From FundTracker?
      </h2>

      <ul className="list-disc pl-6 text-gray-700 space-y-3">
        <li>Donors looking to support high-impact fundraising campaigns</li>
        <li>NGOs analyzing crowdfunding performance trends</li>
        <li>Researchers studying fundraising growth patterns</li>
        <li>Students exploring crowdfunding data analytics</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Our Mission
      </h2>

      <p className="text-gray-700">
        Our mission is to improve transparency in crowdfunding by making
        fundraising data accessible, structured, and easy to analyze.
        FundTracker aims to empower smarter donation decisions through
        data-driven insights.
      </p>
    </div>
  );
}