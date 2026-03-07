import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How FundTracker Calculates Trust and Impact Scores | FundTracker",
  description: "Learn about our transparent methodology for evaluating campaign trust ratings, impact scores, and NGO transparency metrics.",
}

export default function TrustScorePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How FundTracker Calculates Trust and Impact Scores
          </h1>
          <p className="text-xl text-emerald-100">
            Transparent methodology for evaluating campaign quality and NGO effectiveness
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              FundTracker helps donors make informed decisions by providing transparent, data-driven trust and impact scores for fundraising campaigns across multiple platforms. Our scoring methodology combines verified data, platform reputation, campaign activity, and transparency indicators.
            </p>
          </div>

          {/* Trust Score */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-3xl font-bold text-emerald-600 mb-4">✅ Trust Score (0-100)</h2>
            <p className="text-lg text-gray-700 mb-6">
              The Trust Score evaluates campaign credibility and transparency based on the following factors:
            </p>
            
            <div className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Platform Verification (30 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Campaigns on verified platforms like GlobalGiving, Ketto, Milaap score higher</li>
                  <li>Platform KYC and compliance standards</li>
                  <li>Platform track record and reputation</li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Campaign Transparency (25 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Detailed campaign description and documentation</li>
                  <li>Clear funding breakdown and usage plan</li>
                  <li>Regular updates and progress reports</li>
                  <li>Verifiable beneficiary information</li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. NGO Credibility (20 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Registered nonprofit status verification</li>
                  <li>Financial transparency and annual reporting</li>
                  <li>Tax exemption certification (80G, 12A in India)</li>
                  <li>Historical track record</li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">4. Donor Engagement (15 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Number of unique donors</li>
                  <li>Donation frequency and patterns</li>
                  <li>Community feedback and testimonials</li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">5. Data Verification (10 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Cross-platform data validation</li>
                  <li>Real-time funding progress accuracy</li>
                  <li>Consistent campaign information</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Impact Score */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-3xl font-bold text-orange-600 mb-4">⭐ Impact Score (0-100)</h2>
            <p className="text-lg text-gray-700 mb-6">
              The Impact Score measures the potential and actual effectiveness of a campaign based on:
            </p>
            
            <div className="space-y-6">
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Funding Progress (30 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Percentage of goal achieved</li>
                  <li>Growth rate and momentum</li>
                  <li>Time efficiency in reaching milestones</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Category Impact Potential (25 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Emergency and medical campaigns score higher</li>
                  <li>Beneficiary reach and scale</li>
                  <li>Long-term vs. immediate impact</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. NGO Track Record (20 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Previous campaign success rate</li>
                  <li>Reported outcomes and impact metrics</li>
                  <li>Beneficiary testimonials and case studies</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">4. Campaign Activity (15 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Frequency of updates and communication</li>
                  <li>Responsiveness to donor queries</li>
                  <li>Social media engagement</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">5. Measurable Outcomes (10 points)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Clear success metrics defined</li>
                  <li>Regular impact reporting</li>
                  <li>Third-party verification when available</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">📊 Data Sources</h2>
            <p className="text-lg text-gray-700 mb-4">
              FundTracker aggregates data from multiple verified sources:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Fundraising platform APIs (GlobalGiving, Ketto, Milaap, etc.)</li>
              <li>NGO registration databases and government records</li>
              <li>Charity evaluation organizations (GiveWell, Charity Navigator)</li>
              <li>Real-time donation tracking and campaign updates</li>
              <li>Community feedback and donor reviews</li>
            </ul>
          </div>

          {/* Updates */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🔄 Score Updates</h2>
            <p className="text-lg text-gray-700">
              Scores are updated daily based on the latest campaign data, donation activity, and transparency indicators. Campaigns showing consistent improvement in transparency and impact will see their scores increase over time.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">⚠️ Important Note</h2>
            <p className="text-lg text-gray-700">
              While FundTracker trust and impact scores provide valuable insights, donors should conduct their own research before making donation decisions. Scores are indicators based on available data and do not constitute financial or charitable giving advice.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-block bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg"
          >
            Browse Campaigns
          </Link>
        </div>

      </section>

    </main>
  )
}
