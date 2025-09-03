"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSamplePayments } from "@/mock_data/admin-sample"
import { Button } from "@/components/ui/button"

type Payment = { id: string; method: string; status: string; amount: number; date: string; orderId: string }
export default function PaymentsAdminPage() {
  const [logs, setLogs] = useState<Payment[]>(useMemo(()=>getSamplePayments(),[]))
  const approveRefund = (id:string)=> setLogs(prev=>prev.map(p=>p.id===id?{...p,status:"Refunded"}:p))
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Payments & Refunds</CardTitle>
          <CardDescription>View payment logs and approve refunds</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/40">
              <tr>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(p=>(
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.orderId}</td>
                  <td className="p-3">{p.method}</td>
                  <td className="p-3">Rs. {p.amount.toFixed(2)}</td>
                  <td className="p-3">{p.date}</td>
                  <td className={"p-3 "+(p.status==="Failed"?"text-red-600": p.status==="Refunded"?"text-orange-600":"text-green-700")}>{p.status}</td>
                  <td className="p-3">
                    {p.status==="Paid" && <Button variant="outline" onClick={()=>approveRefund(p.id)}>Approve Refund</Button>}
                  </td>
                </tr>
              ))}
              {!logs.length && <tr><td colSpan={7} className="p-4 text-center text-neutral-500">No logs</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
