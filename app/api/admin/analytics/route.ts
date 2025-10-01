import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { ORDER_STATUS } from "@/models/constants";
import Refund from "@/models/Refund";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonths = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

    // Revenue by month (last 6 months)
    const revenueByMonthAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfPrevMonths },
          status: {
            $in: [
              ORDER_STATUS.CONFIRMED,
              ORDER_STATUS.DELIVERED,
              ORDER_STATUS.SHIPPED,
            ],
          },
        },
      },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          total: { $sum: "$total" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const revenueByMonth = revenueByMonthAgg.map(
      (r: { _id: { m: number }; total: number }) => ({
        month: monthLabels[r._id.m - 1],
        total: r.total,
      })
    );

    // Orders by status (current month)
    const ordersByStatusAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const ordersByStatus = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.CANCELLED,
    ].map((s) => ({
      status: s,
      count:
        ordersByStatusAgg.find(
          (x: { _id: string; count: number }) => x._id === s
        )?.count || 0,
    }));

    // Top products by units (year-to-date)
    const topProductsAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", units: { $sum: "$items.quantity" } } },
      { $sort: { units: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          id: { $toString: "$product._id" },
          title: "$product.name",
          units: 1,
        },
      },
    ]);
    const topProducts = topProductsAgg;

    // Low stock items (consider variants when present)
    const lowStockProducts = await Product.aggregate([
      {
        $lookup: {
          from: "variants",
          localField: "variants",
          foreignField: "_id",
          as: "variantDocs",
        },
      },
      {
        $addFields: {
          totalStock: {
            $cond: [
              { $gt: [{ $size: "$variantDocs" }, 0] },
              { $sum: "$variantDocs.stock" },
              "$stock",
            ],
          },
        },
      },
      { $match: { totalStock: { $lte: 10 } } },
      {
        $project: {
          id: { $toString: "$_id" },
          title: "$name",
          qty: "$totalStock",
        },
      },
      { $sort: { qty: 1 } },
      { $limit: 10 },
    ]);
    const lowStock = lowStockProducts;

    // Active customers by unique email (includes guests) YTD
    const activeEmails = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
          "contact.email": { $ne: "" },
        },
      },
      { $group: { _id: { $toLower: "$contact.email" } } },
      { $count: "count" },
    ]).catch(() => [] as { count: number }[]);
    const activeCustomers = activeEmails[0]?.count || 0;

    // Additional KPIs
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const todayAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, orders: { $sum: 1 }, sales: { $sum: "$total" } } },
    ]).catch(() => [] as { orders: number; sales: number }[]);
    const today = {
      orders: todayAgg[0]?.orders || 0,
      sales: todayAgg[0]?.sales || 0,
    };

    // Average Order Value (AOV) YTD
    const aovAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, sales: { $sum: "$total" }, orders: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          aov: {
            $cond: [
              { $gt: ["$orders", 0] },
              { $divide: ["$sales", "$orders"] },
              0,
            ],
          },
        },
      },
    ]).catch(() => [] as unknown[]);
    const aov = aovAgg[0]?.aov || 0;

    // 14-day orders trend
    const startOf14 = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 13
    );
    const ordersTrendAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOf14 } } },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]).catch(() => [] as unknown[]);
    const ordersTrend = ordersTrendAgg.map(
      (r: { _id: { m: number; d: number }; count: number }) => ({
        date: `${r._id.m}/${r._id.d}`,
        count: r.count,
      })
    );

    // Payment status split (YTD)
    const paymentStatusAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: "$payment.status", count: { $sum: 1 } } },
    ]).catch(() => [] as unknown[]);
    const paymentStatus = paymentStatusAgg.map(
      (x: { _id: string; count: number }) => ({
        status: x._id,
        count: x.count,
      })
    );

    // Shipping method split (YTD)
    const shippingSplitAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: "$shippingMethod", count: { $sum: 1 } } },
    ]).catch(() => [] as unknown[]);
    const shippingSplit = shippingSplitAgg.map(
      (x: { _id: string; count: number }) => ({
        method: x._id,
        count: x.count,
      })
    );

    // Refunds summary (YTD)
    const refundsAgg = await Refund.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]).catch(() => [] as { _id: string; count: number; amount: number }[]);
    const refunds = refundsAgg.map(
      (r: { _id: string; count: number; amount: number }) => ({
        status: r._id,
        count: r.count,
        amount: r.amount,
      })
    );

    // New vs Repeat by normalized email (YTD)
    const ytdByEmail = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
          "contact.email": { $ne: "" },
        },
      },
      { $group: { _id: { $toLower: "$contact.email" }, orders: { $sum: 1 } } },
      {
        $group: {
          _id: null,
          new: { $sum: { $cond: [{ $lte: ["$orders", 1] }, 1, 0] } },
          repeat: { $sum: { $cond: [{ $gt: ["$orders", 1] }, 1, 0] } },
        },
      },
      { $project: { _id: 0, new: 1, repeat: 1 } },
    ]).catch(() => [] as unknown[]);
    const newCustomers = ytdByEmail[0]?.new || 0;
    const repeatCustomers = ytdByEmail[0]?.repeat || 0;

    // Top categories by sales (YTD) - robust pipeline with safe lookups
    let topCategories: { category: string; sales: number }[] = [];
    try {
      const topCategoriesAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        { $unwind: "$items" },
        // Compute sales per product first
        {
          $group: {
            _id: "$items.product",
            productSales: {
              $sum: {
                $multiply: ["$items.quantity", "$items.priceAtPurchase"],
              },
            },
          },
        },
        // Attach product and its categories
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "prod",
          },
        },
        { $unwind: { path: "$prod", preserveNullAndEmptyArrays: true } },
        {
          $unwind: {
            path: "$prod.categories",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Sum sales by category id (can be null)
        {
          $group: {
            _id: "$prod.categories",
            sales: { $sum: "$productSales" },
          },
        },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        // Lookup category document by _id
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            id: { $toString: "$cat._id" },
            name: { $ifNull: ["$cat.name", "Uncategorized"] },
            sales: 1,
          },
        },
      ]);
      topCategories = topCategoriesAgg.filter(
        (c: { id?: string; name: string }) => c.id || c.name === "Uncategorized"
      );
    } catch (e) {
      console.error("Top categories aggregation failed:", e);
      topCategories = [];
    }

    return NextResponse.json({
      revenueByMonth,
      ordersByStatus,
      topProducts,
      lowStock,
      activeCustomers,
      today,
      aov,
      ordersTrend,
      paymentStatus,
      shippingSplit,
      customers: { new: newCustomers, repeat: repeatCustomers },
      topCategories,
      refunds,
    });
  } catch (error: unknown) {
    console.error("Error computing analytics:", error);
    return NextResponse.json(
      {
        error: "Failed to compute analytics",
        details: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
