"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { downloadCSV } from "@/lib/csv"
import { getSampleOrders } from "@/mock_data/admin-sample"

type Order = {
  id: string; customer: string; total: number; status: "Pending"|"Processing"|"Completed"|"Refunded"
  payment: "COD"|"JazzCash"|"Easypaisa"
  date: string; items: number; tracking?: string
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>(useMemo(()=>getSampleOrders(),[]))
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<string>("")
  const filtered = useMemo(()=>orders.filter(o=>{
    return (!q || o.id.includes(q) || o.customer.toLowerCase().includes(q.toLowerCase())) &&
           (!status || o.status===status)
  }),[orders,q,status])

  const updateStatus = (id: string, s: Order["status"]) => setOrders(prev=>prev.map(o=>o.id===id?{...o,status:s}:o))

  const exportCSV = ()=>{
    const rows = [["id","date","customer","total","items","status","payment","tracking"],
    ...filtered.map(o=>[o.id,o.date,o.customer,o.total,o.items,o.status,o.payment,o.tracking ?? ""])]
    downloadCSV(rows, "orders.csv")
  }

  const exportPDF = ()=> window.print()

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
              {["Pending","Processing","Completed","Refunded"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
            <Button variant="outline" onClick={exportPDF}>Export PDF</Button>
          </div>

          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/40">
                <tr>
                  <th className="p-3 text-left">Order</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Items</th>
                  <th className="p-3 text-left">Payment</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o=>(
                  <tr key={o.id} className="border-t">
                    <td className="p-3">{o.id}</td>
                    <td className="p-3">{o.date}</td>
                    <td className="p-3">{o.customer}</td>
                    <td className="p-3">${o.total.toFixed(2)}</td>
                    <td className="p-3">{o.items}</td>
                    <td className="p-3">{o.payment}</td>
                    <td className="p-3">
                      <select className="rounded border bg-transparent px-2 py-1" value={o.status} onChange={(e)=>updateStatus(o.id, e.target.value as Order["status"])}>
                        {["Pending","Processing","Completed","Refunded"].map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={7} className="p-4 text-center text-neutral-500">No orders found</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-neutral-500">Delivery tracking and notifications can be integrated with your courier APIs.</p>
        </CardContent>
      </Card>
    </div>
  )
}
