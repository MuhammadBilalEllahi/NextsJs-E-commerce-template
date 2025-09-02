import Link from "next/link"
import { AlertTriangle, Shield, Info, FileText } from 'lucide-react'

export default function DisclaimersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            Disclaimers
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Important information about our products and services
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Important Notice
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Please read these disclaimers carefully before using our products or services. By using our website and purchasing our products, you acknowledge that you have read, understood, and agree to these disclaimers.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border shadow-sm">
          <div className="space-y-8">
            {/* Product Information */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Info className="h-6 w-6 text-blue-600" />
                Product Information Disclaimer
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  While we strive to provide accurate and up-to-date information about our products, we cannot guarantee that all product descriptions, nutritional information, or other content on our website is completely accurate, complete, or current.
                </p>
                <p>
                  Product images are for illustrative purposes only and may not exactly match the actual product received. Colors, sizes, and packaging may vary slightly from what is shown on our website.
                </p>
                <p>
                  We reserve the right to modify product information, pricing, and availability without prior notice.
                </p>
              </div>
            </section>

            {/* Health and Safety */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                Health and Safety Disclaimer
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Our products are intended for culinary use and general consumption. They are not intended to diagnose, treat, cure, or prevent any disease or health condition.
                </p>
                <p>
                  If you have any known allergies, sensitivities, or medical conditions, please consult with a healthcare professional before consuming our products.
                </p>
                <p>
                  We recommend storing our products according to the instructions provided and consuming them before the expiration date for optimal quality and safety.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    ⚠️ Allergen Warning: Our products may contain traces of nuts, dairy, gluten, and other common allergens. Please check product labels carefully.
                  </p>
                </div>
              </div>
            </section>

            {/* Website Usage */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" />
                Website Usage Disclaimer
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Our website is provided "as is" without any warranties, express or implied. We do not guarantee that our website will be uninterrupted, secure, or error-free.
                </p>
                <p>
                  We are not responsible for any damages or losses that may result from the use of our website, including but not limited to technical issues, data loss, or service interruptions.
                </p>
                <p>
                  External links on our website are provided for convenience only. We do not endorse or take responsibility for the content, privacy policies, or practices of third-party websites.
                </p>
              </div>
            </section>

            {/* Pricing and Availability */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Pricing and Availability Disclaimer</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  All prices are subject to change without notice. Prices displayed on our website are in Pakistani Rupees (PKR) unless otherwise stated.
                </p>
                <p>
                  Product availability is subject to change. We reserve the right to discontinue any product at any time without prior notice.
                </p>
                <p>
                  In the event of a pricing error on our website, we reserve the right to correct the error and adjust your order accordingly.
                </p>
              </div>
            </section>

            {/* Delivery and Shipping */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Delivery and Shipping Disclaimer</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Delivery times are estimates only and may vary due to factors beyond our control, including weather conditions, traffic, and delivery partner availability.
                </p>
                <p>
                  We are not responsible for delays in delivery caused by incorrect or incomplete delivery information provided by customers.
                </p>
                <p>
                  Risk of loss and title for products pass to you upon delivery to the carrier. We are not responsible for any damage or loss that occurs during transit.
                </p>
              </div>
            </section>

            {/* Returns and Refunds */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Returns and Refunds Disclaimer</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Our return and refund policies are subject to change. Please refer to our current Return & Refund Policy for the most up-to-date information.
                </p>
                <p>
                  We reserve the right to refuse returns or refunds for products that have been opened, damaged, or used beyond what is necessary to determine their condition.
                </p>
                <p>
                  Refunds may take 5-10 business days to process and appear in your account, depending on your payment method and financial institution.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  To the maximum extent permitted by law, Dehli Mirch shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our products or services.
                </p>
                <p>
                  Our total liability to you for any claims arising from the use of our products or services shall not exceed the amount you paid for the specific product or service in question.
                </p>
              </div>
            </section>

            {/* Updates to Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Updates to Disclaimers</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We reserve the right to update these disclaimers at any time. Changes will be effective immediately upon posting on our website.
                </p>
                <p>
                  It is your responsibility to review these disclaimers periodically for any changes. Your continued use of our website and products after any changes constitutes acceptance of the updated disclaimers.
                </p>
                <p>
                  The last updated date of these disclaimers is: <span className="font-medium">December 1, 2024</span>
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Contact Information</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                If you have any questions about these disclaimers, please contact us:
              </p>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <strong>Email:</strong> legal@dehlimirch.com<br />
                  <strong>Phone:</strong> +92 321 4375872<br />
                  <strong>Address:</strong> 17-B-1, Shop No. 4, Chowdry Chowk, College Road, Township, Lahore, Pakistan
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














