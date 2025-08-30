import Link from "next/link"
import { Truck, Clock, Shield, MapPin } from 'lucide-react'
import { CURRENCY, formatCurrency } from "@/lib/constants/currency"

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            Shipping Policy
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Fast, reliable delivery to bring authentic spices to your doorstep
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Free Shipping</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Free delivery on orders over {formatCurrency(CURRENCY.FREE_SHIPPING_THRESHOLD)} across Pakistan
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Fast Delivery</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              1-3 business days for major cities, 3-5 days for other areas
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Secure Packaging</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Products packed with care to maintain freshness and quality
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border shadow-sm">
          <div className="space-y-8">
            {/* Delivery Areas */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-red-600" />
                Delivery Areas
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Major Cities (1-3 days)</h3>
                  <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                    <li>• Lahore</li>
                    <li>• Karachi</li>
                    <li>• Islamabad</li>
                    <li>• Rawalpindi</li>
                    <li>• Faisalabad</li>
                    <li>• Multan</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Other Areas (3-5 days)</h3>
                  <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                    <li>• All other cities and towns</li>
                    <li>• Rural areas</li>
                    <li>• Remote locations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Shipping Costs */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Shipping Costs</h2>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-600 mb-2">Free Shipping</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Orders over {formatCurrency(CURRENCY.FREE_SHIPPING_THRESHOLD)} qualify for free standard delivery
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Standard Shipping</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatCurrency(CURRENCY.STANDARD_SHIPPING_COST)} for orders under {formatCurrency(CURRENCY.FREE_SHIPPING_THRESHOLD)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery Process */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Delivery Process</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Order Confirmation</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      You'll receive an email confirmation with order details and tracking information
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Processing</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Your order is carefully packed and prepared for shipping within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Delivery</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Our delivery partner will contact you to arrange the best delivery time
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Packaging */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Packaging</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                We take great care in packaging your spices to ensure they arrive in perfect condition:
              </p>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                <li>• Airtight containers to maintain freshness</li>
                <li>• Protective packaging to prevent damage</li>
                <li>• Temperature-controlled shipping when necessary</li>
                <li>• Clear labeling for easy identification</li>
              </ul>
            </section>

            {/* Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Order Tracking</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Track your order from our kitchen to your doorstep:
              </p>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  You'll receive tracking updates via SMS and email. You can also track your order through your account dashboard.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Need Help?</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                If you have any questions about shipping or delivery, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Customer Service</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Email: support@dehlimirch.com<br />
                    Phone: +92 321 4375872
                  </p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Business Hours</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Monday - Saturday: 9:00 AM - 8:00 PM<br />
                    Sunday: 10:00 AM - 6:00 PM
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
