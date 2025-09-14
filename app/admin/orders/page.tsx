"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { downloadCSV } from "@/lib/csv"
import { OrderDetailsSidebar } from "@/components/admin/orders/order-details-sidebar"

type Order = {
  id: string
  orderId: string
  refId: string
  date: string
  customer: string
  email: string
  total: number
  itemsCount: number
  shippingMethod: string
  shippingFee: number
  tcsFee: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  payment: "cod"
  paymentStatus: "pending" | "paid" | "failed"
  tracking: string
  cancellationReason?: string
  history: Array<{
    status: string
    changedAt: string
    changedBy: string
    reason: string
  }>
  address: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
    phone: string
    country: string
  }
  billingAddress?: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
    phone: string
    country: string
  }
  items: Array<{
    productTitle: string
    variantLabel: string
    quantity: number
    price: number
  }>
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Order details sidebar state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const filtered = useMemo(()=>orders.filter(o=>{
    return (!q || o.orderId.includes(q) || o.refId.includes(q) || o.customer.toLowerCase().includes(q.toLowerCase()) || o.email.toLowerCase().includes(q.toLowerCase())) &&
           (!status || o.status===status)
  }),[orders,q,status])

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(status && { status }),
        ...(q && { search: q })
      })
      
      const response = await fetch(`/api/admin/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load orders on component mount and when filters change
  useEffect(() => {
    fetchOrders()
  }, [page, status])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (q !== '') {
        fetchOrders()
      } else {
        fetchOrders()
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [q])

  const updateStatus = async (id: string, newStatus: Order["status"], cancellationReason?: string) => {
    try {
      const requestBody: any = { 
        orderId: id, 
        status: newStatus,
        changedBy: 'admin'
      }
      
      if (newStatus === 'cancelled' && cancellationReason) {
        requestBody.cancellationReason = cancellationReason
      }
      
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        // Refresh the orders list to get updated data
        await fetchOrders()
        // Clear cancellation input
        setShowCancellationInput(prev => ({ ...prev, [id]: false }))
        setCancellationReasons(prev => ({ ...prev, [id]: '' }))
      } else {
        console.error('Failed to update order status')
        alert('Failed to update order status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error updating order status. Please try again.')
    }
  }

  const handleStatusChange = (id: string, newStatus: Order["status"]) => {
    if (newStatus === 'cancelled') {
      // Show cancellation reason input
      setShowCancellationInput(prev => ({ ...prev, [id]: true }))
    } else {
      // Update status directly
      updateStatus(id, newStatus)
    }
  }

  const handleCancelWithReason = (id: string) => {
    const reason = cancellationReasons[id]
    if (!reason?.trim()) {
      alert('Please provide a cancellation reason')
      return
    }
    updateStatus(id, 'cancelled', reason)
  }

  const updateTracking = async (id: string, tracking: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, tracking: tracking })
      })
      
      if (response.ok) {
        // Update the local state immediately for better UX
        setOrders(prev => prev.map(o => o.id === id ? { ...o, tracking: tracking } : o))
      } else {
        console.error('Failed to update tracking number')
      }
    } catch (error) {
      console.error('Error updating tracking number:', error)
    }
  }

  // Debounced tracking update
  const [trackingTimeouts, setTrackingTimeouts] = useState<Record<string, NodeJS.Timeout>>({})
  const [updatingTracking, setUpdatingTracking] = useState<Record<string, boolean>>({})
  const [cancellationReasons, setCancellationReasons] = useState<Record<string, string>>({})
  const [showCancellationInput, setShowCancellationInput] = useState<Record<string, boolean>>({})
  
  const handleTrackingChange = (id: string, tracking: string) => {
    // Update local state immediately
    setOrders(prev => prev.map(o => o.id === id ? { ...o, tracking: tracking } : o))
    
    // Clear existing timeout for this order
    if (trackingTimeouts[id]) {
      clearTimeout(trackingTimeouts[id])
    }
    
    // Set updating state
    setUpdatingTracking(prev => ({ ...prev, [id]: true }))
    
    // Set new timeout for API call
    const timeout = setTimeout(async () => {
      await updateTracking(id, tracking)
      setTrackingTimeouts(prev => {
        const newTimeouts = { ...prev }
        delete newTimeouts[id]
        return newTimeouts
      })
      setUpdatingTracking(prev => {
        const newUpdating = { ...prev }
        delete newUpdating[id]
        return newUpdating
      })
    }, 1000) // 1 second delay
    
    setTrackingTimeouts(prev => ({ ...prev, [id]: timeout }))
  }

  // Cleanup tracking timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(trackingTimeouts).forEach(timeout => clearTimeout(timeout))
    }
  }, [trackingTimeouts])

  const exportCSV = ()=>{
    const rows = [["orderId","refId","date","customer","total","items","shippingMethod","shippingFee","tcsFee","status","payment","tracking"],
    ...filtered.map(o=>[o.orderId,o.refId,o.date,o.customer,o.total,o.itemsCount,o.shippingMethod,o.shippingFee,o.tcsFee,o.status,o.payment,o.tracking ?? ""])]
    downloadCSV(rows, "orders.csv")
  }

  const exportPDF = ()=> window.print()

  // Handle opening order details sidebar
  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedOrderId(null)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Filter by status, update orders, export reports</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid md:grid-cols-[1fr_200px_auto_auto] gap-2">
            <Input placeholder="Search order/customer..." value={q} onChange={(e)=>setQ(e.target.value)} />
            <select className="rounded border px-2 py-2 bg-transparent" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {["pending","confirmed","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
            <Button variant="outline" onClick={exportPDF}>Export PDF</Button>
          </div>

          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/40">
                <tr>
                  <th className="p-3 text-left">Order ID</th>
                  <th className="p-3 text-left">Ref ID</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Items</th>
                  <th className="p-3 text-left">Shipping</th>
                  <th className="p-3 text-left">Payment</th>
                  <th className="p-3 text-left">Status & Tracking</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-4 text-center text-neutral-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : (
                  filtered.map(o=>(
                    <tr key={o.id} className="border-t">
                      <td className="p-3 font-mono text-sm">{o.orderId}</td>
                      <td className="p-3 font-mono text-sm">{o.refId}</td>
                      <td className="p-3">{o.date}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{o.customer}</div>
                          <div className="text-xs text-neutral-500">{o.email}</div>
                        </div>
                      </td>
                      <td className="p-3">Rs. {o.total.toFixed(2)}</td>
                      <td className="p-3">{o.itemsCount}</td>
                      <td className="p-3">
                        <div className="text-xs">
                          <div className="font-medium">{o.shippingMethod.replace("_", " ")}</div>
                          {o.shippingFee > 0 && <div>Shipping: Rs. {o.shippingFee}</div>}
                          {o.tcsFee > 0 && <div>TCS: Rs. {o.tcsFee}</div>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs">
                          <div className="font-medium">{o.payment.toUpperCase()}</div>
                          <div className="text-neutral-500">{o.paymentStatus}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <select className="w-full rounded border bg-transparent px-2 py-1 text-sm" value={o.status} onChange={(e)=>handleStatusChange(o.id, e.target.value as Order["status"])}>
                            {["pending","confirmed","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                          </select>
                          
                          {/* Cancellation reason input */}
                          {showCancellationInput[o.id] && (
                            <div className="space-y-1">
                              <input 
                                type="text" 
                                placeholder="Cancellation reason (visible to customer)" 
                                className="w-full rounded border bg-transparent px-2 py-1 text-xs"
                                value={cancellationReasons[o.id] || ''}
                                onChange={(e) => setCancellationReasons(prev => ({ ...prev, [o.id]: e.target.value }))}
                              />
                              <div className="flex gap-1">
                                <button 
                                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                  onClick={() => handleCancelWithReason(o.id)}
                                >
                                  Confirm
                                </button>
                                <button 
                                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                  onClick={() => {
                                    setShowCancellationInput(prev => ({ ...prev, [o.id]: false }))
                                    setCancellationReasons(prev => ({ ...prev, [o.id]: '' }))
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Show existing cancellation reason */}
                          {o.status === "cancelled" && o.cancellationReason && (
                            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                              <strong>Reason:</strong> {o.cancellationReason}
                            </div>
                          )}
                          
                          {o.status === "shipped" && (
                            <div className="relative">
                              <input 
                                type="text" 
                                placeholder="Tracking #" 
                                className="w-full rounded border bg-transparent px-2 py-1 text-xs pr-6"
                                value={o.tracking}
                                onChange={(e) => handleTrackingChange(o.id, e.target.value)}
                              />
                              {updatingTracking[o.id] && (
                                <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                                  <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrderDetails(o.id)}
                          className="text-xs"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && !filtered.length && (
                  <tr>
                    <td colSpan={10} className="p-4 text-center text-neutral-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-neutral-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          
          <p className="text-xs text-neutral-500">Delivery tracking and notifications can be integrated with your courier APIs.</p>
        </CardContent>
      </Card>
      
      {/* Order Details Sidebar */}
      <OrderDetailsSidebar
        orderId={selectedOrderId}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  )
}
