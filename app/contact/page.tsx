'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Track the contact form submission
    trackEvent('contact_form_submission', {
      subject: formData.subject,
    })

    // Here you would typically send the form data to a backend service
    // For now, we'll just show a success message
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-600">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                  <a
                    href="mailto:fundtrackersupport@gmail.com"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-lg break-all"
                  >
                    fundtrackersupport@gmail.com
                  </a>
                  <p className="text-sm text-gray-600 mt-2">We typically respond within 24-48 hours</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About FundTracker</h3>
                  <p className="text-gray-700">
                    FundTracker is a charity discovery platform helping you find and support verified nonprofits and campaigns worldwide.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/privacy" className="text-emerald-600 hover:text-emerald-700">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="/terms" className="text-emerald-600 hover:text-emerald-700">
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a href="/" className="text-emerald-600 hover:text-emerald-700">
                        Browse Campaigns
                      </a>
                    </li>
                    <li>
                      <a href="/blog" className="text-emerald-600 hover:text-emerald-700">
                        Blog & Guides
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-100 border border-emerald-300 rounded-lg">
                <p className="text-emerald-800 font-semibold">✓ Message sent successfully!</p>
                <p className="text-emerald-700 text-sm">We'll get back to you as soon as possible.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select a subject</option>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Report a Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Please tell us what's on your mind..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By submitting this form, you agree to our{' '}
              <a href="/privacy" className="text-emerald-600 hover:text-emerald-700">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
