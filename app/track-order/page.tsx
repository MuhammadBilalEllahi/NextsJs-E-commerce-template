"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Package, Truck, Clock, XCircle, AlertCircle, MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { formatCurrency } from "@/lib/constants/currency"
import { useSearchParams } from "next/navigation"

type OrderData = {
  orderId: string
  refId: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  tracking: string
  cancellationReason?: string
  history: Array<{
    status: string
    changedAt: string
    changedBy: string
    reason: string
  }>
  createdAt: string
  updatedAt: string
  contact: {
    email: string
    phone: string
  }
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
    phone: string
    country: string
  }
  shippingMethod: string
  payment: {
    method: string
    status: string
  }
  items: Array<{
    productTitle: string
    variantLabel: string
    quantity: number
    price: number
    image: string
    productSlug: string
    variantSku: string
    totalPrice: number
  }>
  subtotal: number
  shippingFee: number
  total: number
}

const statusSteps = [
  { key: "pending", title: "Order Received", icon: Clock, description: "Your order has been received and is being processed" },
  { key: "confirmed", title: "Order Confirmed", icon: Package, description: "Your order has been confirmed and is being prepared" },
  { key: "shipped", title: "Order Shipped", icon: Truck, description: "Your order has been shipped and is on its way" },
  { key: "delivered", title: "Order Delivered", icon: CheckCircle2, description: "Your order has been delivered successfully" },
  { key: "cancelled", title: "Order Cancelled", icon: XCircle, description: "Your order has been cancelled" },
] as const

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderData, setOrderData] = useState<OrderData | null>(null)

  const onTrack = useCallback(async () => {
    if (!orderId.trim()) {
      setError("Please enter an order ID or reference ID")
      return
    }
    
    setLoading(true)
    setError("")
    setOrderData(null)
    
    try {
      const response = await fetch(`/api/track-order?orderId=${encodeURIComponent(orderId.trim())}`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('Order data received:', data.order)
        setOrderData(data.order)
      } else {
        setError(data.error || "Order not found")
      }
    } catch (error) {
      setError("Failed to fetch order. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    const orderIdParam = searchParams.get("orderId")
    if (orderIdParam) {
      console.log("orderId", orderIdParam)
      setOrderId(orderIdParam)
    } else {
      // console.log("No orderId found")
      // setError("Please enter an order ID or reference ID")
    }
  }, [searchParams])

  useEffect(() => {
    if (orderId) {
      onTrack()
    }
  }, [orderId, onTrack])

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status)
  }

  const getStatusStep = (status: string) => {
    return statusSteps.find(step => step.key === status) || statusSteps[0]
  }

  const getRelevantStatusSteps = (status: string) => {
    if (status === 'cancelled') {
      // For cancelled orders, only show pending and cancelled steps
      return statusSteps.filter(step => step.key === 'pending' || step.key === 'cancelled')
    }
    // For other statuses, show all steps up to and including the current status
    const currentIndex = getStatusIndex(status)
    return statusSteps.slice(0, currentIndex + 1)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Enter your order ID or reference ID to view order status and details</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-3 max-w-lg mx-auto">
              <Input 
                placeholder="e.g., DM123456 or REF12345" 
                value={orderId} 
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onTrack()}
                className="flex-1"
              />
              <Button 
                onClick={onTrack} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Tracking..." : "Track Order"}
        </Button>
      </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderData && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Status Timeline */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Current Status */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const currentStep = getStatusStep(orderData.status)
                          const Icon = currentStep.icon
                          return (
                            <>
                              <div className={`p-2 rounded-full ${
                                orderData.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                orderData.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              }`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                                  {currentStep.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {currentStep.description}
                                </p>
                                {orderData.tracking && orderData.status === 'shipped' && (
                                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                                    Tracking: {orderData.tracking}
                                  </p>
                                )}
                                {orderData.cancellationReason && orderData.status === 'cancelled' && (
                                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                      Cancellation Reason:
                                    </p>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                      {orderData.cancellationReason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                                        {/* Status Timeline */}
                    <div className="space-y-3">
                      {getRelevantStatusSteps(orderData.status).map((step, idx) => {
                        const Icon = step.icon
                        const isActive = step.key === orderData.status
                        const isCompleted = orderData.status !== 'cancelled' && getStatusIndex(orderData.status) > getStatusIndex(step.key)
                        const isCancelled = orderData.status === 'cancelled' && step.key !== 'cancelled'
                        
                        return (
                          <div key={step.key} className={`flex items-center gap-3 p-3 rounded-lg ${
                            isActive ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
                            isCompleted ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                            isCancelled ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700' :
                            'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                          }`}>
                            <div className={`p-2 rounded-full ${
                              isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                              isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                              isCancelled ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                isActive ? 'text-blue-900 dark:text-blue-100' :
                                isCompleted ? 'text-green-900 dark:text-green-100' :
                                isCancelled ? 'text-gray-500 dark:text-gray-400' :
                                'text-gray-500 dark:text-gray-400'
                              }`}>
                                {step.title}
                              </h4>
                              <p className={`text-sm ${
                                isActive ? 'text-blue-700 dark:text-blue-300' :
                                isCompleted ? 'text-green-700 dark:text-green-300' :
                                'text-gray-500 dark:text-gray-400'
                              }`}>
                                {step.description}
                              </p>
                            </div>
                            {isCompleted && (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order History */}
              {orderData.history && orderData.history.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {orderData.history
                        .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
                        .map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Clock className="h-3 w-3" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 capitalize">
                                {entry.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {new Date(entry.changedAt).toLocaleString()}
                              </span>
                            </div>
                            {entry.reason && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {entry.reason}
                              </p>
                            )}
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                              Changed by: {entry.changedBy === 'system' ? 'System' : entry.changedBy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Details Sidebar */}
            <div className="space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Order ID:</span>
                    <p className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{orderData.orderId}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Reference ID:</span>
                    <p className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{orderData.refId}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Order Date:</span>
                    <p className="text-neutral-900 dark:text-neutral-100">{new Date(orderData.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Payment Method:</span>
                    <p className="uppercase text-neutral-900 dark:text-neutral-100">{orderData.payment.method}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Amount:</span>
                    <p className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">{formatCurrency(orderData.total)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
                    </p>
                    <p className="text-neutral-700 dark:text-neutral-300">{orderData.shippingAddress.address}</p>
                    <p className="text-neutral-700 dark:text-neutral-300">{orderData.shippingAddress.city}</p>
                    {orderData.shippingAddress.postalCode && (
                      <p className="text-neutral-700 dark:text-neutral-300">{orderData.shippingAddress.postalCode}</p>
                    )}
                    <p className="flex items-center gap-1 mt-2 text-neutral-700 dark:text-neutral-300">
                      <Phone className="h-3 w-3" />
                      {orderData.shippingAddress.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <Mail className="h-4 w-4" />
                    {orderData.contact.email}
                  </p>
                  <p className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <Phone className="h-4 w-4" />
                    {orderData.contact.phone}
                  </p>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.image || '/placeholder.svg'}
                          alt={item.productTitle}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                            {item.productTitle}
                          </p>
                          {item.variantLabel && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              {item.variantLabel}
                            </p>
                          )}
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500">
                            Price: {formatCurrency(item.price)} each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">Subtotal:</span>
                      <span className="text-neutral-900 dark:text-neutral-100">{formatCurrency(orderData.subtotal)}</span>
                    </div>
                    {orderData.shippingFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Shipping:</span>
                        <span className="text-neutral-900 dark:text-neutral-100">{formatCurrency(orderData.shippingFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold">
                      <span className="text-neutral-900 dark:text-neutral-100">Total:</span>
                      <span className="text-neutral-900 dark:text-neutral-100">{formatCurrency(orderData.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    Having trouble with your order? Our support team is here to help.
                  </p>
                  <a
                    href={`https://wa.me/923001234567?text=${encodeURIComponent(`Hello Dehli Mirch, I need help with my order ${orderData.orderId}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Support
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Support Section for when no order is found */}
        {error && !orderData && (
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Can't find your order?</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                If you're having trouble tracking your order, our support team can help you.
              </p>
              <a
                href={`https://wa.me/923001234567?text=${encodeURIComponent(`Hello Dehli Mirch, I need help tracking my order.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
