export const metadata = {
  title: 'Privacy Policy | FundTracker',
  description: 'Learn how FundTracker protects your data and privacy',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().getFullYear()}</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p>
              FundTracker ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Device information (browser type, operating system, IP address)</li>
                  <li>Usage data (pages visited, time spent, interactions)</li>
                  <li>Geographic information (general location based on IP)</li>
                  <li>Referrer information (how you arrived at our site)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Information You Provide</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Email address when subscribing to our newsletter</li>
                  <li>Search queries and campaign preferences</li>
                  <li>Contact information if you reach out to support</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Improve and personalize your experience</li>
              <li>Send newsletters and updates (you can unsubscribe anytime)</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Detect and prevent fraud or security issues</li>
              <li>Comply with legal obligations</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </section>

          {/* Analytics & Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Tracking</h2>
            <p>
              We use Google Analytics 4 and similar tools to understand how visitors use our website. These services collect information about your browsing activity and help us improve our platform. You can opt out of tracking by adjusting your browser settings or using privacy-focused browser extensions.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p>
              FundTracker aggregates information from GlobalGiving and other charitable platforms. We do not share your personal information with these platforms unless you click through to their websites. When you do, you will be subject to their privacy policies.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience. Cookies help us remember your preferences, track your behavior, and improve our website. You can control cookie settings in your browser.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p>
              Our website is not intended for children under 13. We do not knowingly collect personal information from children. If we learn we have collected personal information from a child under 13, we will promptly delete such information.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access your personal information</li>
              <li>Request corrections or updates</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          {/* Policy Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we will notify users of significant updates via email or prominent website notification.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:{' '}
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
