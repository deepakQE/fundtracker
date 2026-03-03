export const metadata = {
  title: "Fundraising Analytics Tool | FundTracker",
  description:
    "FundTracker is a fundraising analytics tool that helps donors, NGOs, and researchers analyze crowdfunding campaign performance and growth trends.",
};

export default function FundraisingAnalyticsTool() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-emerald-600 mb-8">
        Fundraising Analytics Tool
      </h1>

      <p className="mb-6 text-lg text-gray-700">
        FundTracker is a modern fundraising analytics tool designed to help
        users discover, compare, and analyze crowdfunding campaigns. It
        provides insights into campaign growth, donation trends, and funding
        performance across platforms.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Why Use a Fundraising Analytics Tool?
      </h2>

      <p className="mb-6 text-gray-700">
        Evaluating fundraising campaigns manually can be time-consuming.
        A fundraising analytics tool like FundTracker simplifies the process
        by presenting structured campaign data, growth indicators, and
        performance comparisons in one dashboard.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Key Features of FundTracker
      </h2>

      <ul className="list-disc pl-6 text-gray-700 space-y-3">
        <li>Campaign growth tracking</li>
        <li>Donation progress monitoring</li>
        <li>Trust and transparency insights</li>
        <li>Structured fundraising performance data</li>
      </ul>
    </div>
  );
}