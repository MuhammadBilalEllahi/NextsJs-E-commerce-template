import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";
import tcsService from "@/lib/api/tcs/tcsService";
import { TCS_STATUS, ORDER_STATUS } from "@/lib/constants";

// Get specific TCS order details
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const order = await Order.findById(id);

    if (!order || order.courier?.provider !== "tcs") {
      return NextResponse.json(
        { error: "Order with TCS courier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Failed to fetch TCS order:", error);
    return NextResponse.json(
      { error: "Failed to fetch TCS order" },
      { status: 500 }
    );
  }
}

// Update TCS order (track, cancel, etc.)
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await req.json();

    const { action, ...actionData } = body;

    const order = await Order.findById(id);
    if (!order || order.courier?.provider !== "tcs") {
      return NextResponse.json(
        { error: "Order with TCS courier not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "track":
        await handleTrackOrder(order);
        break;

      case "cancel":
        await handleCancelOrder(order, actionData);
        break;

      case "update_status":
        await handleUpdateStatus(order, actionData);
        break;

      case "get_pickup_status":
        await handleGetPickupStatus(order);
        break;

      case "get_payment_details":
        await handleGetPaymentDetails(order);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      data: order,
      message: `Action ${action} completed successfully`,
    });
  } catch (error) {
    console.error("Failed to update TCS order:", error);
    return NextResponse.json(
      {
        error: "Failed to update TCS order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions for different actions
async function handleTrackOrder(order: any) {
  try {
    const trackingResponse = await tcsService.trackOrder(
      order.courier?.credentials?.userName,
      order.courier?.credentials?.password,
      order.courier?.customerReferenceNo || order.refId
    );

    order.courier.lastApiCall = new Date();
    order.courier.apiResponse = trackingResponse;

    if (trackingResponse.cnDetail && trackingResponse.cnDetail.length > 0) {
      const cnDetail = trackingResponse.cnDetail[0];

      // Update tracking history
      order.courier.trackingHistory.push({
        status: "tracked",
        location: cnDetail.destination || "",
        timestamp: new Date(),
        description: `Order tracked via TCS API`,
        updatedBy: "admin",
      });

      // Update status based on TCS response
      // Note: TCS API doesn't provide detailed status, so we maintain our own status
    }
  } catch (error) {
    console.error("Failed to track TCS order:", error);
    order.courier.apiErrors.push(
      `Track failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function handleCancelOrder(order: any, actionData: any) {
  try {
    if (!order.courier?.consignmentNumber) {
      throw new Error("No consignment number available for cancellation");
    }

    const cancelResponse = await tcsService.cancelOrder({
      userName: order.courier.credentials?.userName,
      password: order.courier.credentials?.password,
      consignmentNumber: order.courier.consignmentNumber,
    });

    order.courier.status = "cancelled";
    order.courier.lastApiCall = new Date();
    order.courier.apiResponse = cancelResponse;

    // Update main order status
    order.status = ORDER_STATUS.CANCELLED;
    order.cancellationReason = actionData.reason || "Cancelled via TCS";
    order.history.push({
      status: ORDER_STATUS.CANCELLED,
      changedAt: new Date(),
      changedBy: "admin",
      reason: `TCS order cancelled: ${
        actionData.reason || "No reason provided"
      }`,
    });

    order.courier.trackingHistory.push({
      status: "cancelled",
      location: "",
      timestamp: new Date(),
      description: `Order cancelled: ${
        actionData.reason || "No reason provided"
      }`,
      updatedBy: "admin",
    });
  } catch (error) {
    console.error("Failed to cancel TCS order:", error);
    order.courier.apiErrors.push(
      `Cancel failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function handleUpdateStatus(order: any, actionData: any) {
  const { status, reason } = actionData;

  if (!status) {
    throw new Error("Invalid status");
  }

  order.courier.status = status;

  order.courier.trackingHistory.push({
    status: status,
    location: actionData.location || "",
    timestamp: new Date(),
    description: reason || `Status updated to ${status}`,
    updatedBy: "admin",
  });

  // Update main order status if needed
  if (order) {
    let orderStatus = order.status;

    switch (status) {
      case "picked_up":
        orderStatus = ORDER_STATUS.CONFIRMED;
        break;
      case "in_transit":
      case "out_for_delivery":
        orderStatus = ORDER_STATUS.SHIPPED;
        break;
      case "delivered":
        orderStatus = ORDER_STATUS.DELIVERED;
        order.courier.actualDelivery = new Date();
        break;
      case "cancelled":
        orderStatus = ORDER_STATUS.CANCELLED;
        break;
    }

    if (orderStatus !== order.status) {
      order.status = orderStatus;
      order.history.push({
        status: orderStatus,
        changedAt: new Date(),
        changedBy: "admin",
        reason: `Courier status updated to ${status}`,
      });
    }
  }
}

async function handleGetPickupStatus(order: any) {
  try {
    if (!order.courier?.consignmentNumber) {
      throw new Error("No consignment number available");
    }

    const pickupResponse = await tcsService.getPickupStatus(
      order.courier.consignmentNumber
    );

    order.courier.lastApiCall = new Date();
    order.courier.pickupStatus =
      pickupResponse.returnStatus?.status === "SUCCESS"
        ? "picked_up"
        : "pending";

    order.courier.trackingHistory.push({
      status: "pickup_checked",
      location: "",
      timestamp: new Date(),
      description: `Pickup status checked: ${
        pickupResponse.returnStatus?.message || "No message"
      }`,
      updatedBy: "admin",
    });
  } catch (error) {
    console.error("Failed to get pickup status:", error);
    order.courier.apiErrors.push(
      `Pickup status check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function handleGetPaymentDetails(order: any) {
  try {
    if (!order.courier?.consignmentNumber) {
      throw new Error("No consignment number available");
    }

    const paymentResponse = await tcsService.getPaymentDetails(
      order.courier.consignmentNumber
    );

    order.courier.lastApiCall = new Date();
    order.courier.paymentDetails = paymentResponse;

    order.courier.trackingHistory.push({
      status: "payment_checked",
      location: "",
      timestamp: new Date(),
      description: `Payment details checked: ${
        paymentResponse.returnStatus?.message || "No message"
      }`,
      updatedBy: "admin",
    });
  } catch (error) {
    console.error("Failed to get payment details:", error);
    order.courier.apiErrors.push(
      `Payment details check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
