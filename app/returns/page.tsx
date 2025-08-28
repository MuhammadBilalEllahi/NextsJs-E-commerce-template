import Link from "next/link"
import { RotateCcw, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            Return & Refund Policy
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            We want you to be completely satisfied with your purchase
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">7-Day Returns</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Return eligible items within 7 days of delivery for a full refund
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Easy Process</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Simple return process with prepaid shipping labels
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <RotateCcw className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Quick Refunds</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Refunds processed within 5-10 business days
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border shadow-sm">
          <div className="space-y-8">
            {/* Return Policy Overview */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Return Policy Overview</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  At Dehli Mirch, we stand behind the quality of our products. If you're not completely satisfied with your purchase, we offer a 7-day return window for most items.
                </p>
                <p>
                  To be eligible for a return, your item must be unused, in its original packaging, and in the same condition that you received it. You must also have the receipt or proof of purchase.
                </p>
              </div>
            </section>

            {/* Return Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Return Eligibility</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Eligible for Return
                  </h3>
                  <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                    <li>• Unopened products in original packaging</li>
                    <li>• Products with manufacturing defects</li>
                    <li>• Wrong items received</li>
                    <li>• Damaged items during shipping</li>
                    <li>• Products within 7 days of delivery</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Not Eligible for Return
                  </h3>
                  <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                    <li>• Opened or used products</li>
                    <li>• Products past expiration date</li>
                    <li>• Items damaged by customer</li>
                    <li>• Products beyond 7-day window</li>
                    <li>• Sale or clearance items</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Return Process */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">How to Return an Item</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Contact Customer Service</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Email us at returns@dehlimirch.com or call +92 321 4375872 with your order number and reason for return
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Get Return Authorization</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      We'll provide you with a return authorization number and prepaid shipping label if applicable
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Package and Ship</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Securely package the item with the return authorization number and ship it back to us
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Receive Refund</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Once we receive and inspect your return, we'll process your refund within 5-10 business days
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Information */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Refund Information</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Refunds will be processed to the original payment method used for the purchase. Processing times may vary:
                </p>
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <ul className="space-y-2">
                    <li>• <strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                    <li>• <strong>Bank Transfers:</strong> 3-5 business days</li>
                    <li>• <strong>Digital Wallets:</strong> 1-3 business days</li>
                    <li>• <strong>Cash on Delivery:</strong> Bank transfer within 7-10 business days</li>
                  </ul>
                </div>
                <p>
                  <strong>Note:</strong> Shipping costs are non-refundable unless the return is due to our error (wrong item, defective product, etc.).
                </p>
              </div>
            </section>

            {/* Special Circumstances */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Special Circumstances</h2>
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Damaged or Defective Items
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    If you receive a damaged or defective item, please contact us immediately. We'll arrange for a replacement or refund, and we'll cover the return shipping costs.
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Wrong Items Received</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    If you receive the wrong item, we'll arrange for the correct item to be sent to you at no additional cost, and we'll cover the return shipping for the incorrect item.
                  </p>
                </div>
              </div>
            </section>

            {/* Return Shipping */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Return Shipping</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  For returns due to our error (wrong item, defective product), we'll provide a prepaid shipping label at no cost to you.
                </p>
                <p>
                  For customer-initiated returns (change of mind, etc.), you'll be responsible for return shipping costs. We recommend using a trackable shipping method.
                </p>
                <p>
                  <strong>Return Address:</strong><br />
                  Dehli Mirch Returns<br />
                  17-B-1, Shop No. 4, Chowdry Chowk<br />
                  College Road, Township, Lahore, Pakistan
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Need Help with Returns?</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Our customer service team is here to help with any questions about returns or refunds:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Customer Service</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Email: returns@dehlimirch.com<br />
                    Phone: +92 321 4375872<br />
                    Hours: Mon-Sat 9:00 AM - 8:00 PM
                  </p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Return Processing</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Processing Time: 1-2 business days<br />
                    Inspection Time: 1-2 business days<br />
                    Refund Time: 5-10 business days
                  </p>
                </div>
              </div>
            </section>

            {/* Policy Updates */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Policy Updates</h2>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  We reserve the right to modify this return and refund policy at any time. Changes will be effective immediately upon posting on our website.
                </p>
                <p>
                  The last updated date of this policy is: <span className="font-medium">December 1, 2024</span>
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
