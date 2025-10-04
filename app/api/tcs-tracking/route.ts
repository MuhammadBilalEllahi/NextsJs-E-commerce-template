import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import TCSOrder from "@/models/TCSOrder";
import Order from "@/models/Order";
import tcsService from "@/lib/api/tcs/tcsService";
import { ORDER_TYPE } from "@/models/constants";

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

// Get TCS tracking information for customer
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

    // Find the main order first with populated product details
    let order = await Order.findOne(query)
      .populate("items.product", "name images slug description price")
      .populate("items.variant", "label sku price stock")
      .lean();

    // Alternative approach: try without lean() if population fails
    if (order && order.items?.length > 0 && !order.items[0].product?.name) {
      console.debug("Population failed, trying without lean()...");
      order = await Order.findOne(query)
        .populate("items.product", "name images slug description price")
        .populate("items.variant", "label sku price stock");
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if this is a TCS order
    const isTCS: boolean = order.shippingMethod === ORDER_TYPE.TCS;

    if (isTCS) {
      // Find TCS order
      const tcsOrder = await TCSOrder.findOne({ order: order.id });

      if (!tcsOrder) {
        // Return formatted order without TCS data
        const formattedOrder = formatOrder(order);
        return NextResponse.json({
          success: true,
          data: {
            order: formattedOrder,
            tcsOrder: null,
            deliveryInfo: {
              isOutsideLahore: tcsService.isOutsideLahore(
                order.shippingAddress.city
              ),
              estimatedDays: tcsService.getEstimatedDeliveryDays(
                order.shippingAddress.city
              ),
              shippingMethod: order.shippingMethod,
            },
            message: "No TCS order found for this order",
          },
        });
      }

      // Try to get latest tracking info from TCS API
      let latestTracking = null;
      try {
        const trackingResponse = await tcsService.trackOrder(
          tcsOrder.userName,
          tcsOrder.password,
          tcsOrder.customerReferenceNo
        );

        latestTracking = trackingResponse;

        // Update last API call time
        tcsOrder.lastApiCall = new Date();
        await tcsOrder.save();
      } catch (error) {
        console.error("Failed to get latest TCS tracking:", error);
        // Continue with cached data
      }

      // Format order for customer display
      const formattedOrder = formatOrder(order);

      // Prepare response data for TCS orders
      const responseData = {
        order: formattedOrder,
        tcsOrder: {
          consignmentNumber: tcsOrder.consignmentNumber,
          status: tcsOrder.status,
          estimatedDelivery: tcsOrder.estimatedDelivery,
          actualDelivery: tcsOrder.actualDelivery,
          trackingHistory: tcsOrder.trackingHistory,
          pickupStatus: tcsOrder.pickupStatus,
          paymentStatus: tcsOrder.paymentStatus,
          weight: tcsOrder.weight,
          pieces: tcsOrder.pieces,
          codAmount: tcsOrder.codAmount,
          originCityName: tcsOrder.originCityName,
          destinationCityName: tcsOrder.destinationCityName,
          services: tcsOrder.services,
          fragile: tcsOrder.fragile,
          remarks: tcsOrder.remarks,
          lastApiCall: tcsOrder.lastApiCall,
        },
        latestTracking: latestTracking,
        deliveryInfo: {
          isOutsideLahore: tcsService.isOutsideLahore(
            order.shippingAddress.city
          ),
          estimatedDays: tcsService.getEstimatedDeliveryDays(
            order.shippingAddress.city
          ),
          shippingMethod: order.shippingMethod,
        },
      };

      return NextResponse.json({
        success: true,
        data: responseData,
      });
    } else {
      // For non-TCS orders, return formatted order data
      const formattedOrder = formatOrder(order);

      return NextResponse.json({
        success: true,
        data: {
          order: formattedOrder,
          tcsOrder: null,
          deliveryInfo: {
            isOutsideLahore: false,
            estimatedDays: 1,
            shippingMethod: order.shippingMethod,
          },
        },
      });
    }
  } catch (error) {
    console.error("Failed to get tracking information:", error);
    return NextResponse.json(
      { error: "Failed to get tracking information" },
      { status: 500 }
    );
  }
}
