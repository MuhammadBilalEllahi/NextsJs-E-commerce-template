import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/database/mongodb";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";

// GET - Get all users' carts (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    let query: any = {};

    // Filter by specific user if provided
    if (userId) {
      query.user = userId;
    }

    // Filter by specific session if provided
    if (sessionId) {
      query.uuidv4 = sessionId;
    }

    const skip = (page - 1) * limit;

    const carts = await Cart.find(query)
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "items.productId",
        populate: {
          path: "variants",
          match: { isActive: true },
        },
      })
      .populate("items.variantId")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Cart.countDocuments(query);

    // Get order conversion data
    const cartIds = carts.map((cart) => cart._id);
    const orders = await Order.find({
      $or: [
        { user: { $in: carts.filter((c) => c.user).map((c) => c.user) } },
        {
          "contact.email": {
            $in: carts.filter((c) => !c.user).map((c) => c.uuidv4),
          },
        },
      ],
    }).lean();

    // Format the response
    const formattedCarts = carts.map((cart) => {
      const user = cart.user as any;

      // Determine user identifier
      const userIdentifier = user
        ? {
            type: "registered",
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
          }
        : {
            type: "guest",
            sessionId: cart.uuidv4,
            userName: "Guest User",
            userEmail: `Session: ${cart.uuidv4}`,
          };

      // Calculate cart totals
      const subtotal = cart.items.reduce((sum: number, item: any) => {
        return sum + item.priceSnapshot * item.quantity;
      }, 0);

      // Check for order conversion
      const hasOrder = orders.some((order: any) => {
        if (user) {
          return order.user?.toString() === user._id.toString();
        } else {
          return order.contact?.email === cart.uuidv4;
        }
      });

      // Calculate days since last update
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(cart.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return {
        id: cart._id,
        ...userIdentifier,
        items: cart.items.map((item: any) => ({
          productId: item.productId._id,
          productName: item.title,
          productSlug: item.slug,
          productImage: item.image,
          variantId: item.variantId?._id || null,
          variantLabel: item.label || null,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
          addedAt: item.createdAt,
        })),
        itemCount: cart.items.length,
        subtotal,
        currency: cart.currency,
        updatedAt: cart.updatedAt,
        daysSinceUpdate,
        hasOrder,
        version: cart.version,
      };
    });

    return NextResponse.json({
      success: true,
      carts: formattedCarts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin carts:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart data" },
      { status: 500 }
    );
  }
}

// DELETE - Remove cart (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cartId = searchParams.get("id");

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await Cart.findByIdAndDelete(cartId);

    if (!result) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Cart removed",
    });
  } catch (error) {
    console.error("Error removing cart:", error);
    return NextResponse.json(
      { error: "Failed to remove cart" },
      { status: 500 }
    );
  }
}
