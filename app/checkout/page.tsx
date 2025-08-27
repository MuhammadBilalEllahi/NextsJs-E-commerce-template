"use client"

import { useCart } from "@/lib/providers/cartProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, HelpCircle, Lock } from 'lucide-react'
import Link from "next/link"

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [shippingMethod, setShippingMethod] = useState("free")
  const [billingAddress, setBillingAddress] = useState("same")
  const [emailNewsletter, setEmailNewsletter] = useState(true)
  const [saveInfo, setSaveInfo] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      const orderId = "DM" + Math.floor(Math.random() * 1_000_000).toString()
      clear()
      router.push(`/order/success?orderId=${orderId}`)
    }, 1200)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">Your cart is empty.</p>
          <Link href="/category/all">
            <Button className="bg-green-600 hover:bg-green-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const shippingCost = subtotal > 50 ? 0 : 4.99
  const total = subtotal + shippingCost

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/cart" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800">
              <ArrowLeft className="h-4 w-4" />
              Back to cart
            </Link>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Complete your order</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Contact
                  <span className="ml-2 text-sm font-normal text-neutral-600 dark:text-neutral-400">
                    (Login to earn loyalty points 🎉🎁🎊)
                  </span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email or mobile phone number</Label>
                    <Input id="email" type="email" required placeholder="Enter your email or phone" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="newsletter" 
                      checked={emailNewsletter}
                      onCheckedChange={(checked) => setEmailNewsletter(checked as boolean)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">Email me with news and offers</Label>
                  </div>
                </div>
              </section>

              {/* Delivery Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" required placeholder="Street address" />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required />
                  </div>
                  <div>
                    <Label htmlFor="postal">Postal code (optional)</Label>
                    <Input id="postal" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      Phone
                      <HelpCircle className="h-3 w-3" />
                    </Label>
                    <Input id="phone" required placeholder="+92 3XX XXXXXXX" />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="saveInfo" 
                        checked={saveInfo}
                        onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
                      />
                      <Label htmlFor="saveInfo" className="text-sm">Save this information for next time</Label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Shipping Method Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Shipping method</h2>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="free" id="free" />
                      <Label htmlFor="free">Free Home Delivery</Label>
                    </div>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                </RadioGroup>
              </section>

              {/* Payment Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Payment</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  All transactions are secure and encrypted.
                </p>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="jazzcash" id="jazzcash" />
                        <Label htmlFor="jazzcash">JazzCash</Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="easypaisa" id="easypaisa" />
                        <Label htmlFor="easypaisa">Easypaisa</Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod">Cash on Delivery (COD)</Label>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </section>

              {/* Billing Address Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Billing address</h2>
                <RadioGroup value={billingAddress} onValueChange={setBillingAddress}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="same" id="same" />
                      <Label htmlFor="same">Same as shipping address</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="different" id="different" />
                      <Label htmlFor="different">Use a different billing address</Label>
                    </div>
                  </div>
                </RadioGroup>
              </section>

              {/* Complete Order Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-neutral-800 hover:bg-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 h-12 text-lg"
              >
                {isSubmitting ? "Placing order..." : "Complete order"}
              </Button>

              {/* Footer Links */}
              <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <Link href="/returns" className="hover:underline">Refund policy</Link>
                <Link href="/shipping" className="hover:underline">Shipping</Link>
                <Link href="/privacy" className="hover:underline">Privacy policy</Link>
                <Link href="/terms" className="hover:underline">Terms of service</Link>
                <Link href="/returns" className="hover:underline">Cancellations</Link>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Product List */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center text-xs">
                        {item.qty}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.title}</h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Quantity: {item.qty}</p>
                    </div>
                    <div className="text-sm font-medium">${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="text-center py-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Scroll for more items ↓
                  </div>
                )}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input placeholder="Discount code or gift card" className="flex-1" />
                  <Button variant="outline" className="px-4">Apply</Button>
                </div>
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal • {items.length} items</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    Shipping
                    <HelpCircle className="h-3 w-3" />
                  </span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
