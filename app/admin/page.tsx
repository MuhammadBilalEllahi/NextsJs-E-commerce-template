"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts"
import { useMemo } from "react"
import { getSampleAnalytics } from "@/mock_data/admin-sample"

export default function AdminDashboardPage() {
  const { revenueByMonth, ordersByStatus, topProducts, lowStock } = useMemo(()=>getSampleAnalytics(),[])
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">${(revenueByMonth.slice(-1)[0]?.total ?? 0).toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Completed this month</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{ordersByStatus.find(o=>o.status==="Completed")?.count ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">1,284</CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
            <CardDescription>Line trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ChartContainer
              config={{
                total: { label: "Revenue", color: "hsl(var(--chart-1))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ChartContainer
              config={{
                count: { label: "Orders", color: "hsl(var(--chart-2))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By units</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm">
              {topProducts.map((p)=>(
                <li key={p.id} className="flex items-center justify-between border-b py-2">
                  <span className="truncate pr-2">{p.title}</span>
                  <span className="font-medium">{p.units} sold</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Inventory Alerts</CardTitle>
            <CardDescription>Below threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm">
              {lowStock.length ? lowStock.map((p)=>(
                <li key={p.id} className="flex items-center justify-between border-b py-2">
                  <span className="truncate pr-2">{p.title}</span>
                  <span className="font-medium text-red-600">{p.qty} left</span>
                </li>
              )) : <li className="py-2 text-neutral-500">All good 🎉</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
