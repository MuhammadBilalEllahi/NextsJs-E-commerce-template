import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

function normalizeEmail(email?: string) {
  return (email || "").trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const q = (searchParams.get("q") || "").trim();

    // Fetch registered users (basic fields)
    const userQuery: any = {};
    if (q) {
      userQuery.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    // Aggregate orders by contact.email to include guest customers
    const orderMatch: any = {};
    if (q) {
      orderMatch.$or = [
        { "contact.email": { $regex: q, $options: "i" } },
        { "shippingAddress.firstName": { $regex: q, $options: "i" } },
        { "shippingAddress.lastName": { $regex: q, $options: "i" } },
      ];
    }

    const guestAgg = await Order.aggregate([
      { $match: orderMatch },
      { $match: { "contact.email": { $ne: "" } } },
      {
        $group: {
          _id: { $toLower: "$contact.email" },
          orders: { $sum: 1 },
          totalSpend: { $sum: "$total" },
          lastOrder: { $max: "$createdAt" },
          firstName: { $last: "$shippingAddress.firstName" },
          lastName: { $last: "$shippingAddress.lastName" },
        },
      },
      {
        $project: {
          _id: 0,
          email: "$_id",
          orders: 1,
          totalSpend: 1,
          lastOrder: 1,
          firstName: 1,
          lastName: 1,
        },
      },
    ]);

    // Fetch registered users and compute their order stats
    const registeredUsers = await User.find(userQuery)
      .select("name firstName lastName email role createdAt")
      .lean();

    const registeredEmails = new Set(
      registeredUsers.map((u: any) => normalizeEmail(u.email))
    );

    const ordersByEmailAgg = await Order.aggregate([
      { $match: { "contact.email": { $ne: "" } } },
      {
        $group: {
          _id: { $toLower: "$contact.email" },
          orders: { $sum: 1 },
          totalSpend: { $sum: "$total" },
          lastOrder: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          _id: 0,
          email: "$_id",
          orders: 1,
          totalSpend: 1,
          lastOrder: 1,
        },
      },
    ]);

    const ordersByEmailMap = new Map<
      string,
      { orders: number; totalSpend: number; lastOrder: Date }
    >();
    for (const o of ordersByEmailAgg) {
      ordersByEmailMap.set(o.email, {
        orders: o.orders,
        totalSpend: o.totalSpend,
        lastOrder: o.lastOrder,
      });
    }

    // Merge registered users with their order stats
    const mergedRegistered = registeredUsers.map((u: any) => {
      const email = normalizeEmail(u.email);
      const stats = ordersByEmailMap.get(email);
      return {
        type: "registered" as const,
        id: String(u._id),
        name:
          u.name ||
          `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
          u.email,
        email: u.email,
        orders: stats?.orders || 0,
        total: stats?.totalSpend || 0,
        lastOrder: stats?.lastOrder || null,
        blocked: u.isActive === false ? true : false,
        tags: [] as string[],
      };
    });

    // Guests: include only those not present as registered
    const mergedGuests = guestAgg
      .filter((g: any) => !registeredEmails.has(g.email))
      .map((g: any) => ({
        type: "guest" as const,
        id: g.email,
        name: `${g.firstName || ""} ${g.lastName || ""}`.trim() || g.email,
        email: g.email,
        orders: g.orders || 0,
        total: g.totalSpend || 0,
        lastOrder: g.lastOrder || null,
        blocked: false,
        tags: [] as string[],
      }));

    // Combine, sort by lastOrder desc, then paginate
    const combined = [...mergedRegistered, ...mergedGuests].sort((a, b) => {
      const at = a.lastOrder ? new Date(a.lastOrder).getTime() : 0;
      const bt = b.lastOrder ? new Date(b.lastOrder).getTime() : 0;
      return bt - at;
    });

    const total = combined.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems = combined.slice(start, end);

    return NextResponse.json({
      customers: pageItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Failed to list customers:", error);
    return NextResponse.json(
      { error: "Failed to list customers", details: error.message },
      { status: 500 }
    );
  }
}

