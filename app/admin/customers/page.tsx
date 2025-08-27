"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSampleCustomers } from "@/mock_data/admin-sample"

type Customer = { id: string; name: string; email: string; orders: number; total: number; blocked?: boolean; tags: string[] }

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<Customer[]>(useMemo(()=>getSampleCustomers(),[]))
  const [q, setQ] = useState("")
  const filtered = useMemo(()=>customers.filter(c=> !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())),[customers,q])

  const toggleBlock = (id: string)=> setCustomers(prev=>prev.map(c=>c.id===id?{...c,blocked:!c.blocked}:c))
  const setTags = (id: string, tagsStr: string)=> setCustomers(prev=>prev.map(c=>c.id===id?{...c,tags: tagsStr.split("|").filter(Boolean)}:c))

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>View history, block/unblock, and tag customers</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input placeholder="Search customers..." value={q} onChange={(e)=>setQ(e.target.value)} />
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/40">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Orders</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Tags</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.orders}</td>
                    <td className="p-3">${c.total.toFixed(2)}</td>
                    <td className="p-3">
                      <Input className="h-8 w-56" defaultValue={c.tags.join("|")} onBlur={(e)=>setTags(c.id, e.target.value)} />
                    </td>
                    <td className="p-3">
                      <Button variant="outline" className={c.blocked ? "border-red-600 text-red-600" : ""} onClick={()=>toggleBlock(c.id)}>
                        {c.blocked ? "Unblock" : "Block"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={6} className="p-4 text-center text-neutral-500">No customers found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
