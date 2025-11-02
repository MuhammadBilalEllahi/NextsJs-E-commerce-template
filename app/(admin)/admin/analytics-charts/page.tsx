"use client";

/**
 * Enhanced Analytics Dashboard with Recharts
 * Complete visualization suite for store metrics
 */

import { use Effect, useState } from "react";
import {
  SalesTrendChart,
  CategoryPerformanceChart,
  TopProductsChart,
  RevenueOrdersChart,
  GrowthRateChart,
  generateMockSalesData,
  generateMockCategoryData,
  generateMockProductData,
  generateMockGrowthData,
} from "@/components/charts/AnalyticsCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, Users, BarChart3 } from "lucide-react";

export default function AnalyticsChartsPage() {
  const [salesData, setSalesData] = useState(generateMockSalesData());
  const [categoryData, setCategoryData] = useState(generateMockCategoryData());
  const [productData, setProductData] = useState(generateMockProductData());
  const [growthData, setGrowthData] = useState(generateMockGrowthData());

  // Calculate summary stats
  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  const revenueGrowth = ((salesData[salesData.length - 1].revenue - salesData[0].revenue) / salesData[0].revenue * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Comprehensive store performance metrics and visualizations
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  Rs. {(totalRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{revenueGrowth}% vs last period
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-xs text-gray-600 mt-1">
                  ~{(totalOrders / 30).toFixed(0)}/day
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">Rs. {avgOrderValue.toFixed(0)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  +8.2% improvement
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-green-600 mt-1">
                  +156 this month
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="lg:col-span-2">
          <SalesTrendChart data={salesData} />
        </div>

        {/* Revenue & Orders */}
        <RevenueOrdersChart data={salesData} />

        {/* Category Performance */}
        <CategoryPerformanceChart data={categoryData} />

        {/* Top Products */}
        <div className="lg:col-span-2">
          <TopProductsChart data={productData} />
        </div>

        {/* Growth Rate */}
        <div className="lg:col-span-2">
          <GrowthRateChart data={growthData} />
        </div>
      </div>

      {/* Insights Panel */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-semibold">Strong Revenue Growth</p>
                <p className="text-sm text-gray-700">
                  Revenue increased {revenueGrowth}% compared to the previous period. Spices category
                  is the main driver.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <div>
                <p className="font-semibold">Opportunity: Bundle Deals</p>
                <p className="text-sm text-gray-700">
                  Customers buying Red Chili also purchase Turmeric 68% of the time.
                  Consider creating a spice bundle.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">!</span>
              <div>
                <p className="font-semibold">Watch: Seasonal Trend</p>
                <p className="text-sm text-gray-700">
                  Pickle sales typically increase 35% during wedding season (Nov-Feb).
                  Prepare inventory accordingly.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


