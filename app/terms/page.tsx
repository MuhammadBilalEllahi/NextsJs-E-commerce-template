import Link from "next/link"
import { FileText, Shield, Users, CreditCard, Lock } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            Terms of Service
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please read these terms carefully before using our services
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Agreement to Terms
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                By accessing and using Dehli Mirch's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border shadow-sm">
          <div className="space-y-8">
            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  These Terms of Service ("Terms") govern your use of the Dehli Mirch website and services. By accessing or using our website, you agree to be bound by these Terms and all applicable laws and regulations.
                </p>
                <p>
                  If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
                </p>
              </div>
            </section>

            {/* Use License */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">2. Use License</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Permission is granted to temporarily download one copy of the materials (information or software) on Dehli Mirch's website for personal, non-commercial transitory viewing only.
                </p>
                <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on Dehli Mirch's website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                  <li>transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                3. User Accounts
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </p>
                <p>You are responsible for safeguarding the password and for all activities that occur under your account.</p>
                <p>You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.</p>
              </div>
            </section>

            {/* Product Information */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">4. Product Information</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We strive to display as accurately as possible the colors, images, descriptions, and other information of our products. However, we do not guarantee that your screen's display of any color will be accurate.
                </p>
                <p>
                  We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.
                </p>
                <p>
                  We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations.
                </p>
              </div>
            </section>

            {/* Pricing and Payment */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                5. Pricing and Payment
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  All prices are in Pakistani Rupees (PKR) unless otherwise stated. Prices are subject to change without notice.
                </p>
                <p>
                  Payment must be made at the time of ordering. We accept various payment methods including credit cards, debit cards, bank transfers, and cash on delivery.
                </p>
                <p>
                  By providing payment information, you represent and warrant that you have the legal right to use the payment method and that the information you provide is accurate and complete.
                </p>
              </div>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-purple-600" />
                6. Privacy and Data Protection
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                </p>
                <p>
                  We collect, use, and protect your personal information in accordance with our Privacy Policy and applicable data protection laws.
                </p>
                <p>
                  By using our services, you consent to the collection and use of information in accordance with our Privacy Policy.
                </p>
              </div>
            </section>

            {/* Prohibited Uses */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">7. Prohibited Uses</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>You may not use our website or services:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>for any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>to violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>to infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>to submit false or misleading information</li>
                  <li>to upload or transmit viruses or any other type of malicious code</li>
                  <li>to collect or track the personal information of others</li>
                  <li>to spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">8. Intellectual Property</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  The Service and its original content, features, and functionality are and will remain the exclusive property of Dehli Mirch and its licensors.
                </p>
                <p>
                  The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">9. Limitation of Liability</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  In no event shall Dehli Mirch, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>your use or inability to use the Service</li>
                  <li>any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                  <li>any interruption or cessation of transmission to or from the Service</li>
                  <li>any bugs, viruses, trojan horses, or the like that may be transmitted to or through the Service</li>
                  <li>any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, transmitted, or otherwise made available via the Service</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">10. Termination</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
                <p>
                  If you wish to terminate your account, you may simply discontinue using the Service.
                </p>
                <p>
                  All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">11. Governing Law</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  These Terms shall be interpreted and governed by the laws of Pakistan, without regard to its conflict of law provisions.
                </p>
                <p>
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">12. Changes to Terms</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
                <p>
                  What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">13. Contact Information</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <strong>Email:</strong> legal@dehlimirch.com<br />
                  <strong>Phone:</strong> +92 321 4375872<br />
                  <strong>Address:</strong> 17-B-1, Shop No. 4, Chowdry Chowk, College Road, Township, Lahore, Pakistan
                </p>
              </div>
            </section>

            {/* Effective Date */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">14. Effective Date</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  These Terms of Service are effective as of <span className="font-medium">December 1, 2024</span> and will remain in effect except with respect to any changes in their provisions in the future, which will be in effect immediately after being posted on this page.
                </p>
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
