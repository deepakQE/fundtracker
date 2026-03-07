export const metadata = {
  title: 'Terms of Service | FundTracker',
  description: 'Read our terms of service and usage agreement',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().getFullYear()}</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using FundTracker, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Platform Description */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p>
              FundTracker is a discovery platform that aggregates and displays charitable campaigns and nonprofit information from public sources including GlobalGiving and other platforms. We operate as an information aggregator and discovery tool, not as a financial intermediary or fundraising platform.
            </p>
            <p className="font-semibold text-emerald-700">
              Important: FundTracker has no financial relationship with any campaigns or organizations featured. All donations go directly to the platforms and organizations listed, not to FundTracker.
            </p>
          </section>

          {/* No Endorsement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
            <div className="space-y-4">
              <p>
                <strong>No Financial Ownership:</strong> FundTracker is not a fundraising platform. We do not collect, hold, or manage donations. All funds go directly to the charitable organizations and platforms listed.
              </p>
              <p>
                <strong>No Endorsement:</strong> While we provide information about charities and campaigns, FundTracker does not endorse, recommend, or assume responsibility for any organization or campaign. We encourage you to do your own research before donating.
              </p>
              <p>
                <strong>Information Accuracy:</strong> We strive for accuracy but do not guarantee that all information is current or complete. Campaign details are sourced from GlobalGiving and may change without notice.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
            <p>As a user of FundTracker, you agree to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the platform only for lawful purposes</li>
              <li>Not attempt to interfere with or disrupts the service</li>
              <li>Not reverse-engineer or access data in unauthorized ways</li>
              <li>Respect the intellectual property rights of charities and organizations</li>
              <li>Review organizations' terms before donating</li>
            </ul>
          </section>

          {/* External Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. External Links</h2>
            <p>
              FundTracker contains links to external websites and platforms including GlobalGiving, charity websites, and donation pages. We are not responsible for the content, accuracy, or practices of external sites. When you click "Support Campaign," you are directed to the organization's own donation page or GlobalGiving. You are then subject to that platform's terms and privacy policies.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p>
              FundTracker is provided on an "AS IS" and "AS AVAILABLE" basis. To the fullest extent permitted by law, we disclaim all warranties, express or implied, including merchant ability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              In no event shall FundTracker be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to losses from donation decisions or the performance of any charity or organization.
            </p>
          </section>

          {/* Modification of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modification of Terms</h2>
            <p>
              FundTracker reserves the right to modify these terms at any time. Your continued use of the website following any changes indicates your acceptance of the new terms.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p>
              The content, design, and functionality of FundTracker are the intellectual property of FundTracker. You may not reproduce, distribute, or transmit content without permission. Information about charities and campaigns belongs to their respective organizations.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which FundTracker operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:{' '}
              <a href="mailto:fundtrackersupport@gmail.com" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                fundtrackersupport@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
