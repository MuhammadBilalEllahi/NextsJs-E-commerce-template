import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";
import TCSOrder from "@/models/TCSOrder";
import { generateOrderIds } from "@/lib/utils/orderIds";
import {
  ORDER_STATUS,
  ORDER_PAYMENT_STATUS,
  PAYMENT_TYPE,
  ORDER_TYPE,
  TCS_STATUS,
} from "@/models/constants";
import {
  checkStockAvailability,
  decreaseStockForOrder,
} from "@/lib/utils/stockManager";
import { Resend } from "resend";
import ScheduledJob, { SCHEDULE_TYPES } from "@/models/ScheduledJob";
import tcsService from "@/lib/api/tcs/tcsService";
import whatsappService from "@/lib/api/whatsapp/whatsappService";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      contact,
      shippingAddress,
      billingAddress,
      items,
      subtotal,
      shippingFee,
      total,
      userId,
      sessionId,
      shippingMethod,
    } = body;

    console.debug("body in checkout", body);

    // Check stock availability before creating order
    const stockCheck = await checkStockAvailability(
      items.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.qty,
      }))
    );

    if (!stockCheck.available) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          details: stockCheck.errors,
        },
        { status: 400 }
      );
    }

    // Generate sequential order ID and ref ID using counters
    const { orderId, refId } = await generateOrderIds();

    // Create order
    const order = new Order({
      orderId,
      refId,
      user: userId || null,
      contact: {
        email: contact.email,
        phone: contact.phone,
        marketingOptIn: contact.marketingOptIn || false,
      },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod: shippingMethod,
      payment: {
        method: PAYMENT_TYPE.COD,
        status: ORDER_PAYMENT_STATUS.PENDING,
        transactionId: "",
      },
      items: items.map((item: any) => ({
        product: item.productId,
        variant: item.variantId || null,
        quantity: item.qty,
        priceAtPurchase: item.price,
        label: item.variantLabel || "",
        image: item.image || "",
      })),
      subtotal,
      shippingFee,
      total,
      status: ORDER_STATUS.PENDING,
      history: [
        {
          status: ORDER_STATUS.PENDING,
          changedAt: new Date(),
          changedBy: userId ? userId : "system",
          reason: "Order created",
        },
      ],
    });

    await order.save();

    // Decrease stock for all items in the order
    // Note: Stock is decreased immediately when order is created (status: pending)
    // This ensures inventory consistency and prevents overselling
    try {
      await decreaseStockForOrder(order.id.toString());
      console.debug(`Stock decreased for order ${orderId}`);
    } catch (error) {
      console.error("Failed to decrease stock for order:", error);
      // Note: Stock decrease failed, but order was created
      // This could lead to inventory inconsistency - consider handling this case
      // In production, you might want to rollback the order creation if stock decrease fails
    }

    // Check if order should be sent via TCS
    const shouldUseTCS =
      shippingMethod === ORDER_TYPE.TCS ||
      tcsService.isOutsideLahore(shippingAddress.city);

    let tcsOrder = null;
    if (shouldUseTCS) {
      try {
        // Prepare TCS order data
        const tcsOrderData = tcsService.mapOrderToTCSFormat({
          orderId: order.orderId,
          refId: order.refId,
          shippingAddress: order.shippingAddress,
          contact: order.contact,
          items: items,
          total: order.total,
        });

        // Create TCS order via API
        const tcsResponse = await tcsService.createOrder(tcsOrderData);

        if (tcsResponse.CN) {
          // Create TCS order record in database
          tcsOrder = new TCSOrder({
            order: order.id,
            consignmentNumber: tcsResponse.CN,
            customerReferenceNo: order.refId,
            userName: process.env.TCS_USERNAME || "",
            password: process.env.TCS_PASSWORD || "",
            costCenterCode: process.env.TCS_COST_CENTER_CODE || "",
            consigneeName: tcsOrderData.consigneeName,
            consigneeAddress: tcsOrderData.consigneeAddress,
            consigneeMobNo: tcsOrderData.consigneeMobNo,
            consigneeEmail: tcsOrderData.consigneeEmail,
            originCityName: tcsOrderData.originCityName,
            destinationCityName: tcsOrderData.destinationCityName,
            weight: tcsOrderData.weight,
            pieces: tcsOrderData.pieces,
            codAmount: tcsOrderData.codAmount,
            productDetails: tcsOrderData.productDetails,
            fragile: tcsOrderData.fragile,
            remarks: tcsOrderData.remarks,
            insuranceValue: tcsOrderData.insuranceValue,
            services: tcsOrderData.services,
            status: TCS_STATUS.CREATED,
            tcsResponse: tcsResponse,
            estimatedDelivery: new Date(
              Date.now() +
                tcsService.getEstimatedDeliveryDays(shippingAddress.city) *
                  24 *
                  60 *
                  60 *
                  1000
            ),
          });

          await tcsOrder.save();

          // Update main order with TCS tracking
          order.tracking = tcsResponse.CN;
          order.status = ORDER_STATUS.CONFIRMED;
          order.history.push({
            status: ORDER_STATUS.CONFIRMED,
            changedAt: new Date(),
            changedBy: "system",
            reason: `TCS order created with CN: ${tcsResponse.CN}`,
          });
          await order.save();

          console.debug(
            `TCS order created for order ${orderId} with CN: ${tcsResponse.CN}`
          );
        } else {
          console.error("Failed to create TCS order:", tcsResponse);
        }
      } catch (error) {
        console.error("Failed to create TCS order:", error);
        // Continue with regular order processing even if TCS fails
      }
    }

    // Create scheduled job with complete order information
    // Send WhatsApp notification for order confirmation
    try {
      const orderDataForWhatsApp = {
        orderId: order.orderId,
        refId: order.refId,
        contact: order.contact,
        shippingAddress: order.shippingAddress,
        items: order.items,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        total: order.total,
        shippingMethod: order.shippingMethod,
      };

      await whatsappService.sendOrderConfirmation(orderDataForWhatsApp);
      console.debug(`WhatsApp notification sent for order ${orderId}`);
    } catch (whatsappError) {
      console.error("Failed to send WhatsApp notification:", whatsappError);
      // Don't fail the checkout if WhatsApp fails
    }

    await ScheduledJob.create({
      type: SCHEDULE_TYPES.CHECKOUT_COMPLETE,
      payload: {
        orderId: order.orderId,
        refId: order.refId,
        email: contact.email,
        customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        items: items.map((item: any) => ({
          title: item.title || "Product",
          variantLabel: item.variantLabel || "",
          quantity: item.qty,
          priceAtPurchase: item.price,
          image: item.image || "/placeholder.svg",
        })),
        subtotal,
        shippingFee,
        tcsFee: shippingMethod === ORDER_TYPE.TCS ? 0 : 0, // Add TCS fee logic if needed
        total,
        shippingAddress,
        shippingMethod: shippingMethod,
        paymentMethod: "Cash on Delivery",
        orderDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        estimatedDelivery:
          shouldUseTCS && tcsOrder
            ? `${tcsService.getEstimatedDeliveryDays(
                shippingAddress.city
              )} business days`
            : shippingMethod === "home_delivery"
            ? "Today"
            : "3-5 business days",
        status:
          shouldUseTCS && tcsOrder
            ? ORDER_STATUS.CONFIRMED
            : ORDER_STATUS.PENDING,
        tcsInfo: tcsOrder
          ? {
              consignmentNumber: tcsOrder.consignmentNumber,
              estimatedDelivery: tcsOrder.estimatedDelivery,
              isOutsideLahore: tcsService.isOutsideLahore(shippingAddress.city),
            }
          : null,
      },
      runAt: new Date(Date.now()),
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      orderId,
      refId,
      order: order.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Checkout failed", details: errorMessage },
      { status: 500 }
    );
  }
}
