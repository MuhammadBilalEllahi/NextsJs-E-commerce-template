import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import TCSOrder from "@/models/TCSOrder";
import Order from "@/models/Order";
import tcsService from "@/lib/api/tcs/tcsService";
import { TCS_STATUS, ORDER_STATUS } from "@/models/constants";

// Get specific TCS order details
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const tcsOrder = await TCSOrder.findById(id).populate("order");

    if (!tcsOrder) {
      return NextResponse.json(
        { error: "TCS order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tcsOrder,
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

    const tcsOrder = await TCSOrder.findById(id).populate("order");

    if (!tcsOrder) {
      return NextResponse.json(
        { error: "TCS order not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "track":
        await handleTrackOrder(tcsOrder);
        break;

      case "cancel":
        await handleCancelOrder(tcsOrder, actionData);
        break;

      case "update_status":
        await handleUpdateStatus(tcsOrder, actionData);
        break;

      case "get_pickup_status":
        await handleGetPickupStatus(tcsOrder);
        break;

      case "get_payment_details":
        await handleGetPaymentDetails(tcsOrder);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await tcsOrder.save();

    return NextResponse.json({
      success: true,
      data: tcsOrder,
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
async function handleTrackOrder(tcsOrder: any) {
  try {
    const trackingResponse = await tcsService.trackOrder(
      tcsOrder.userName,
      tcsOrder.password,
      tcsOrder.customerReferenceNo
    );

    tcsOrder.lastApiCall = new Date();

    if (trackingResponse.cnDetail && trackingResponse.cnDetail.length > 0) {
      const cnDetail = trackingResponse.cnDetail[0];

      // Update tracking history
      tcsOrder.trackingHistory.push({
        status: "tracked",
        location: cnDetail.destination || "",
        timestamp: new Date(),
        description: `Order tracked via TCS API`,
        updatedBy: "admin",
      });

      // Update status based on TCS response
      // Note: TCS API doesn't provide detailed status, so we maintain our own status
    }

    tcsOrder.tcsResponse = trackingResponse;
  } catch (error) {
    console.error("Failed to track TCS order:", error);
    tcsOrder.apiErrors.push(
      `Track failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function handleCancelOrder(tcsOrder: any, actionData: any) {
  try {
    if (!tcsOrder.consignmentNumber) {
      throw new Error("No consignment number available for cancellation");
    }

    const cancelResponse = await tcsService.cancelOrder({
      userName: tcsOrder.userName,
      password: tcsOrder.password,
      consignmentNumber: tcsOrder.consignmentNumber,
    });

    tcsOrder.status = TCS_STATUS.CANCELLED;
    tcsOrder.lastApiCall = new Date();
    tcsOrder.tcsResponse = cancelResponse;

    // Update main order status
    if (tcsOrder.order) {
      tcsOrder.order.status = ORDER_STATUS.CANCELLED;
      tcsOrder.order.cancellationReason =
        actionData.reason || "Cancelled via TCS";
      tcsOrder.order.history.push({
        status: ORDER_STATUS.CANCELLED,
        changedAt: new Date(),
        changedBy: "admin",
        reason: `TCS order cancelled: ${
          actionData.reason || "No reason provided"
        }`,
      });
      await tcsOrder.order.save();
    }

    tcsOrder.trackingHistory.push({
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
    tcsOrder.apiErrors.push(
      `Cancel failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function handleUpdateStatus(tcsOrder: any, actionData: any) {
  const { status, reason } = actionData;

  if (!Object.values(TCS_STATUS).includes(status)) {
    throw new Error("Invalid status");
  }

  tcsOrder.status = status;

  tcsOrder.trackingHistory.push({
    status: status,
    location: actionData.location || "",
    timestamp: new Date(),
    description: reason || `Status updated to ${status}`,
    updatedBy: "admin",
  });

  // Update main order status if needed
  if (tcsOrder.order) {
    let orderStatus = tcsOrder.order.status;

    switch (status) {
      case TCS_STATUS.PICKED_UP:
        orderStatus = ORDER_STATUS.CONFIRMED;
        break;
      case TCS_STATUS.IN_TRANSIT:
      case TCS_STATUS.OUT_FOR_DELIVERY:
        orderStatus = ORDER_STATUS.SHIPPED;
        break;
      case TCS_STATUS.DELIVERED:
        orderStatus = ORDER_STATUS.DELIVERED;
        tcsOrder.actualDelivery = new Date();
        break;
      case TCS_STATUS.CANCELLED:
        orderStatus = ORDER_STATUS.CANCELLED;
        break;
    }

    if (orderStatus !== tcsOrder.order.status) {
      tcsOrder.order.status = orderStatus;
      tcsOrder.order.history.push({
        status: orderStatus,
        changedAt: new Date(),
        changedBy: "admin",
        reason: `TCS status updated to ${status}`,
      });
      await tcsOrder.order.save();
    }
  }
}

async function handleGetPickupStatus(tcsOrder: any) {
  try {
    if (!tcsOrder.consignmentNumber) {
      throw new Error("No consignment number available");
    }

    const pickupResponse = await tcsService.getPickupStatus(
      tcsOrder.consignmentNumber
    );

    tcsOrder.lastApiCall = new Date();
    tcsOrder.pickupStatus =
      pickupResponse.returnStatus?.status === "SUCCESS"
        ? "picked_up"
        : "pending";

    tcsOrder.trackingHistory.push({
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
    tcsOrder.apiErrors.push(
      `Pickup status check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function handleGetPaymentDetails(tcsOrder: any) {
  try {
    if (!tcsOrder.consignmentNumber) {
      throw new Error("No consignment number available");
    }

    const paymentResponse = await tcsService.getPaymentDetails(
      tcsOrder.consignmentNumber
    );

    tcsOrder.lastApiCall = new Date();
    tcsOrder.paymentDetails = paymentResponse;

    tcsOrder.trackingHistory.push({
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
    tcsOrder.apiErrors.push(
      `Payment details check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
