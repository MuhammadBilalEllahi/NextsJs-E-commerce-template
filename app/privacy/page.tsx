import Link from "next/link"
import { Shield, Eye, Lock, Database, Users, Bell } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            Privacy Policy
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            How we collect, use, and protect your personal information
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Your Privacy Matters
              </h2>
              <p className="text-sm text-green-700 dark:text-green-300">
                We are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border shadow-sm">
          <div className="space-y-8">
            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-blue-600" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Personal Information</h3>
                    <ul className="space-y-1">
                      <li>• Name and contact information</li>
                      <li>• Email address and phone number</li>
                      <li>• Shipping and billing addresses</li>
                      <li>• Payment information</li>
                      <li>• Account credentials</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Usage Information</h3>
                    <ul className="space-y-1">
                      <li>• Order history and preferences</li>
                      <li>• Website usage patterns</li>
                      <li>• Device and browser information</li>
                      <li>• IP address and location data</li>
                      <li>• Cookies and tracking data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-green-600" />
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>We use the information we collect to:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Service Provision</h3>
                    <ul className="space-y-1">
                      <li>• Process and fulfill your orders</li>
                      <li>• Provide customer support</li>
                      <li>• Send order confirmations</li>
                      <li>• Handle returns and refunds</li>
                      <li>• Maintain your account</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Improvement & Communication</h3>
                    <ul className="space-y-1">
                      <li>• Improve our products and services</li>
                      <li>• Send marketing communications</li>
                      <li>• Personalize your experience</li>
                      <li>• Analyze website usage</li>
                      <li>• Prevent fraud and abuse</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                Information Sharing
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
                </p>
                <div className="space-y-4">
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Service Providers</h3>
                    <p>We may share information with trusted third-party service providers who assist us in operating our website, processing payments, and delivering orders.</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Legal Requirements</h3>
                    <p>We may disclose information when required by law, court order, or government request, or to protect our rights, property, or safety.</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Business Transfers</h3>
                    <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-red-600" />
                Data Security
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Security Measures</h3>
                    <ul className="space-y-1">
                      <li>• SSL encryption for data transmission</li>
                      <li>• Secure payment processing</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls and authentication</li>
                      <li>• Data backup and recovery</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Your Responsibilities</h3>
                    <ul className="space-y-1">
                      <li>• Keep your account credentials secure</li>
                      <li>• Log out after each session</li>
                      <li>• Use strong, unique passwords</li>
                      <li>• Report suspicious activity</li>
                      <li>• Update your contact information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Cookies and Tracking Technologies</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We use cookies and similar tracking technologies to enhance your browsing experience and provide personalized content.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Essential Cookies</h3>
                    <p>Required for basic website functionality, such as shopping cart and user authentication.</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Analytics Cookies</h3>
                    <p>Help us understand how visitors interact with our website and improve our services.</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Marketing Cookies</h3>
                    <p>Used to deliver relevant advertisements and track marketing campaign performance.</p>
                  </div>
                </div>
                <p>
                  You can control cookie settings through your browser preferences. However, disabling certain cookies may affect website functionality.
                </p>
              </div>
            </section>

            {/* Marketing Communications */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Bell className="h-6 w-6 text-orange-600" />
                Marketing Communications
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We may send you marketing communications about our products, services, and promotions. You can opt out of these communications at any time.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Opt-Out Options</h3>
                  <ul className="space-y-1 text-amber-700 dark:text-amber-300">
                    <li>• Unsubscribe link in email communications</li>
                    <li>• Account settings preferences</li>
                    <li>• Contact customer service</li>
                    <li>• Email us at privacy@dehlimirch.com</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Your Privacy Rights</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>You have the following rights regarding your personal information:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Access and Control</h3>
                    <ul className="space-y-1">
                      <li>• Access your personal information</li>
                      <li>• Update or correct your data</li>
                      <li>• Delete your account</li>
                      <li>• Export your data</li>
                      <li>• Restrict processing</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Communication Preferences</h3>
                    <ul className="space-y-1">
                      <li>• Opt out of marketing emails</li>
                      <li>• Manage notification settings</li>
                      <li>• Control cookie preferences</li>
                      <li>• Update contact information</li>
                      <li>• Request data portability</li>
                    </ul>
                  </div>
                </div>
                <p>
                  To exercise these rights, please contact us at privacy@dehlimirch.com. We will respond to your request within 30 days.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Data Retention</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy.
                </p>
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <ul className="space-y-2">
                    <li>• <strong>Account Information:</strong> Retained while your account is active and for 3 years after deactivation</li>
                    <li>• <strong>Order Information:</strong> Retained for 7 years for tax and accounting purposes</li>
                    <li>• <strong>Marketing Data:</strong> Retained until you opt out or for 2 years after last interaction</li>
                    <li>• <strong>Website Analytics:</strong> Retained for 2 years</li>
                    <li>• <strong>Customer Support:</strong> Retained for 3 years after resolution</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Children's Privacy</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
                </p>
                <p>
                  If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to remove such information from our records.
                </p>
              </div>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">International Data Transfers</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws.
                </p>
                <p>
                  When we transfer data internationally, we implement appropriate safeguards such as standard contractual clauses and adequacy decisions.
                </p>
              </div>
            </section>

            {/* Policy Updates */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Updates to This Policy</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending an email notification to registered users</li>
                  <li>Displaying a notice on our website</li>
                </ul>
                <p>
                  The last updated date of this policy is: <span className="font-medium">December 1, 2024</span>
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Contact Us</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Privacy Officer</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Email: privacy@dehlimirch.com<br />
                    Phone: +92 321 4375872<br />
                    Address: 17-B-1, Shop No. 4, Chowdry Chowk, College Road, Township, Lahore, Pakistan
                  </p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Data Protection</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    For data protection inquiries<br />
                    Email: dpo@dehlimirch.com<br />
                    Response Time: Within 30 days
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-red-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
