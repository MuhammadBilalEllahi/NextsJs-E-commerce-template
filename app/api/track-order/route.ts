import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/database/mongodb";

// Helper function to format order data
function formatOrder(order: any) {
  return {
    orderId: order.orderId,
    refId: order.refId,
    status: order.status,
    tracking: order.tracking || "",
    cancellationReason: order.cancellationReason || "",
    history: order.history || [],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    contact: {
      email: order.contact.email,
      phone: order.contact.phone,
    },
    shippingAddress: order.shippingAddress,
    shippingMethod: order.shippingMethod,
    payment: {
      method: order.payment.method,
      status: order.payment.status,
    },
    items: order.items.map((item: any) => {
      console.debug("Processing item:", item);
      return {
        productTitle:
          item.product?.name || item.product?.slug || "Unknown Product",
        variantLabel: item.variant?.label || "",
        quantity: item.quantity,
        price: item.priceAtPurchase, // This is the price from when order was placed
        image: item.product?.images?.[0] || "/placeholder.svg", // Use first image from array
        productSlug: item.product?.slug || "",
        variantSku: item.variant?.sku || "",
        totalPrice: item.priceAtPurchase * item.quantity,
      };
    }),
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
  };
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const refId = searchParams.get("refId");

    if (!orderId && !refId) {
      return NextResponse.json(
        { error: "Order ID or Reference ID is required" },
        { status: 400 }
      );
    }

    // Build query to search by either orderId or refId
    const query: any = {};
    if (orderId) {
      // Try to match either orderId or refId with the provided value
      query.$or = [{ orderId: orderId }, { refId: orderId }];
    } else if (refId) {
      query.refId = refId;
    }

    // Find order with populated product details
    const order = await Order.findOne(query)
      .populate("items.product", "name images slug description price")
      .populate("items.variant", "label sku price stock")
      .lean();

    // Alternative approach: try without lean() if population fails
    if (order && order.items?.length > 0 && !order.items[0].product?.name) {
      console.debug("Population failed, trying without lean()...");
      const orderWithoutLean = await Order.findOne(query)
        .populate("items.product", "name images slug description price")
        .populate("items.variant", "label sku price stock");

      if (orderWithoutLean && orderWithoutLean.items?.[0]?.product?.name) {
        console.debug("Population worked without lean()");
        // Use the non-lean version
        return NextResponse.json({ order: formatOrder(orderWithoutLean) });
      }
    }

    // If population didn't work, try manual population
    if (order && order.items?.length > 0) {
      console.debug("Attempting manual population...");
      // Try to get product names from slugs as fallback
      for (const item of order.items) {
        if (item.product && !item.product.name && item.product.slug) {
          console.debug(`Product ${item.product.slug} missing name field`);
        }
      }
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.debug("Raw order data:", JSON.stringify(order, null, 2));

    // Debug population issues
    console.debug("Population debug:");
    order.items?.forEach((item: any, idx: number) => {
      console.debug(`Item ${idx}:`);
      console.debug("  Product ref:", item.product);
      console.debug("  Variant ref:", item.variant);
      console.debug("  Product type:", typeof item.product);
      console.debug("  Variant type:", typeof item.variant);
      if (item.product) {
        console.debug("  Product fields:", Object.keys(item.product));
      }
      if (item.variant) {
        console.debug("  Variant fields:", Object.keys(item.variant));
      }
    });

    // Format order for customer display
    const formattedOrder = formatOrder(order);

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
