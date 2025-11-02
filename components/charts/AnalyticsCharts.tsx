"use client";

/**
 * Analytics Charts Component
 * Recharts-based visualizations for admin dashboard
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Color palette
const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Sample data interfaces
export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage?: number;
}

export interface ProductData {
  name: string;
  sales: number;
  revenue: number;
  units: number;
}

/**
 * Sales Trend Line Chart
 */
export function SalesTrendChart({ data }: { data: SalesData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Sales Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.primary}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Category Performance Pie Chart
 */
export function CategoryPerformanceChart({ data }: { data: CategoryData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 Sales by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }) =>
                `${category}: ${percentage}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Top Products Bar Chart
 */
export function TopProductsChart({ data }: { data: ProductData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill={COLORS.primary} />
            <Bar dataKey="units" fill={COLORS.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Revenue vs Orders Line Chart
 */
export function RevenueOrdersChart({ data }: { data: SalesData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Revenue & Orders Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.primary}
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke={COLORS.secondary}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Growth Rate Chart
 */
export function GrowthRateChart({
  data,
}: {
  data: { month: string; growth: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Monthly Growth Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="growth"
              fill={COLORS.accent}
              label={{ position: "top" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Generate mock analytics data
 */
export function generateMockSalesData(): SalesData[] {
  const data: SalesData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sales: Math.floor(Math.random() * 50 + 20),
      orders: Math.floor(Math.random() * 30 + 10),
      revenue: Math.floor(Math.random() * 50000 + 20000),
    });
  }

  return data;
}

export function generateMockCategoryData(): CategoryData[] {
  return [
    { category: "Spices", value: 45, percentage: 45 },
    { category: "Pickles", value: 25, percentage: 25 },
    { category: "Condiments", value: 15, percentage: 15 },
    { category: "Snacks", value: 10, percentage: 10 },
    { category: "Others", value: 5, percentage: 5 },
  ];
}

export function generateMockProductData(): ProductData[] {
  return [
    { name: "Red Chili", sales: 150, revenue: 44850, units: 150 },
    { name: "Turmeric", sales: 120, revenue: 30000, units: 120 },
    { name: "Garam Masala", sales: 100, revenue: 39900, units: 100 },
    { name: "Mango Pickle", sales: 90, revenue: 31500, units: 90 },
    { name: "Coriander", sales: 80, revenue: 16000, units: 80 },
  ];
}

export function generateMockGrowthData() {
  return [
    { month: "Jan", growth: 12 },
    { month: "Feb", growth: 15 },
    { month: "Mar", growth: 18 },
    { month: "Apr", growth: 22 },
    { month: "May", growth: 25 },
    { month: "Jun", growth: 28 },
  ];
}


