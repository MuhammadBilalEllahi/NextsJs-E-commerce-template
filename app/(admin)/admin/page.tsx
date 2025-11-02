"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { CURRENCY } from "@/lib/constants";
import { getAdminAnalytics } from "@/lib/api/admin/analytics";

type AnalyticsResponse = {
  revenueByMonth: { month: string; total: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { id: string; title: string; units: number }[];
  lowStock: { id: string; title: string; qty: number }[];
  activeCustomers: number;
  today?: { orders: number; sales: number };
  aov?: number;
  ordersTrend?: { date: string; count: number }[];
  paymentStatus?: { status: string; count: number }[];
  shippingSplit?: { method: string; count: number }[];
  customers?: { new: number; repeat: number };
  topCategories?: { id: string; name: string; sales: number }[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAdminAnalytics()
      .then((j: AnalyticsResponse) => {
        if (isMounted) {
          setData(j);
          setError(null);
        }
      })
      .catch((e) => {
        if (isMounted) setError(e.message || "Error");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const revenueByMonth = data?.revenueByMonth || [];
  const ordersByStatus = data?.ordersByStatus || [];
  const topProducts = data?.topProducts || [];
  const lowStock = data?.lowStock || [];
  const today = data?.today;
  const aov = data?.aov ?? 0;
  const ordersTrend = data?.ordersTrend || [];
  const paymentStatus = data?.paymentStatus || [];
  const shippingSplit = data?.shippingSplit || [];
  const customersSplit = data?.customers;
  const topCategories = data?.topCategories || [];
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading
              ? "—"
              : `${CURRENCY.SYMBOL} ${(
                  revenueByMonth.slice(-1)[0]?.total ?? 0
                ).toLocaleString()}`}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Completed this month</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading
              ? "—"
              : ordersByStatus.find((o) => o.status === "delivered")?.count ??
                0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? "—" : (data?.activeCustomers ?? 0).toLocaleString()}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today’s Sales</CardTitle>
            <CardDescription>As of now</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading
              ? "—"
              : `${CURRENCY.SYMBOL} ${(today?.sales ?? 0).toLocaleString()}`}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today’s Orders</CardTitle>
            <CardDescription>Count</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? "—" : today?.orders ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
            <CardDescription>Year-to-date</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {loading ? "—" : `${CURRENCY.SYMBOL} ${aov.toFixed(2)}`}
          </CardContent>
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
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    strokeWidth={2}
                  />
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
            <CardTitle>Orders - Last 14 Days</CardTitle>
            <CardDescription>Daily count</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ChartContainer
              config={{
                count: { label: "Orders", color: "hsl(var(--chart-3))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers Breakdown</CardTitle>
            <CardDescription>YTD</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm">
              <li className="flex items-center justify-between border-b py-2">
                <span>New customers</span>
                <span className="font-medium">{customersSplit?.new ?? 0}</span>
              </li>
              <li className="flex items-center justify-between border-b py-2">
                <span>Repeat customers</span>
                <span className="font-medium">
                  {customersSplit?.repeat ?? 0}
                </span>
              </li>
            </ul>
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
              {topProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between border-b py-2"
                >
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
              {lowStock.length ? (
                lowStock.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between border-b py-2"
                  >
                    <span className="truncate pr-2">{p.title}</span>
                    <span className="font-medium text-red-600">
                      {p.qty} left
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-2 text-neutral-500">All good 🎉</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>YTD</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm">
              {paymentStatus.map((p) => (
                <li
                  key={p.status}
                  className="flex items-center justify-between border-b py-2"
                >
                  <span className="capitalize">{p.status || "unknown"}</span>
                  <span className="font-medium">{p.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Methods</CardTitle>
            <CardDescription>YTD</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm">
              {shippingSplit.map((s) => (
                <li
                  key={s.method}
                  className="flex items-center justify-between border-b py-2"
                >
                  <span className="capitalize">{s.method || "unknown"}</span>
                  <span className="font-medium">{s.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Sales</CardTitle>
            <CardDescription>YTD</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm">
              {topCategories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <span className="truncate pr-2">{c.name}</span>
                  <span className="font-medium">
                    {CURRENCY.SYMBOL} {c.sales.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}
