import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";
import { generateOrderIds } from "@/lib/utils/orderIds";
import {
  ORDER_STATUS,
  ORDER_PAYMENT_STATUS,
  PAYMENT_TYPE,
  ORDER_TYPE,
} from "@/models/constants/constants";
import {
  checkStockAvailability,
  decreaseStockForOrder,
} from "@/lib/utils/stockManager";
import { Resend } from "resend";
import ScheduledJob, { SCHEDULE_TYPES } from "@/models/ScheduledJob";
import tcsService from "@/lib/api/tcs/tcsService";
import whatsappService from "@/lib/api/whatsapp/whatsappService";
import { getProvider } from "@/lib/api/shipping/providers";

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

    // Use provider registry to handle courier booking dynamically
    const selectedProvider = getProvider(shippingMethod);
    const shouldUseCourier = Boolean(selectedProvider);

    if (shouldUseCourier) {
      try {
        const providerOrderData = selectedProvider?.mapFromOrder?.({
          orderId: order.orderId,
          refId: order.refId,
          shippingAddress: order.shippingAddress,
          contact: order.contact,
          items: items,
          total: order.total,
        });

        const created = await selectedProvider!.create(providerOrderData);

        if (created.tracking) {
          // Embed courier info into the main order
          order.courier = {
            provider: shippingMethod,
            consignmentNumber: created.tracking,
            customerReferenceNo: order.refId,
            credentials: {
              userName: process.env.TCS_USERNAME || "",
              password: process.env.TCS_PASSWORD || "",
              costCenterCode: process.env.TCS_COST_CENTER_CODE || "",
              accountNo: process.env.TCS_ACCOUNT_NO || "",
            },
            consigneeName: providerOrderData.consigneeName,
            consigneeAddress: providerOrderData.consigneeAddress,
            consigneeMobNo: providerOrderData.consigneeMobNo,
            consigneeEmail: providerOrderData.consigneeEmail,
            originCityName: providerOrderData.originCityName,
            destinationCityName: providerOrderData.destinationCityName,
            weight: providerOrderData.weight,
            pieces: providerOrderData.pieces,
            codAmount: providerOrderData.codAmount,
            productDetails: providerOrderData.productDetails,
            fragile: providerOrderData.fragile,
            remarks: providerOrderData.remarks,
            insuranceValue: providerOrderData.insuranceValue,
            services: providerOrderData.services,
            status: "created",
            apiResponse: created.raw,
            lastApiCall: new Date(),
            trackingHistory: [
              {
                status: "created",
                location: providerOrderData.originCityName,
                timestamp: new Date(),
                description: `Order booked with tracking ${created.tracking}`,
                updatedBy: "system",
              },
            ],
            estimatedDelivery: selectedProvider?.estimateDays
              ? new Date(
                  Date.now() +
                    selectedProvider.estimateDays(shippingAddress.city) *
                      24 *
                      60 *
                      60 *
                      1000
                )
              : undefined,
            pickupStatus: "pending",
            paymentStatus: "pending",
            paymentDetails: {},
          } as any;

          // Update main order with tracking
          order.tracking = created.tracking;
          order.status = ORDER_STATUS.CONFIRMED;
          order.history.push({
            status: ORDER_STATUS.CONFIRMED,
            changedAt: new Date(),
            changedBy: "system",
            reason: `Courier order created with tracking: ${created.tracking}`,
          });
          await order.save();

          console.debug(
            `Courier order created for ${orderId} with tracking: ${created.tracking}`
          );
        } else {
          console.error("Failed to create courier order:", created.raw);
        }
      } catch (error) {
        console.error("Failed to create courier order:", error);
        // Continue with regular order processing even if provider fails
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
        estimatedDelivery: shouldUseCourier
          ? `${tcsService.getEstimatedDeliveryDays(
              shippingAddress.city
            )} business days`
          : shippingMethod === "home_delivery"
          ? "Today"
          : "3-5 business days",
        status: shouldUseCourier
          ? ORDER_STATUS.CONFIRMED
          : ORDER_STATUS.PENDING,
        tcsInfo: shouldUseCourier
          ? {
              consignmentNumber: order.tracking,
              estimatedDelivery: order.courier?.estimatedDelivery,
              isOutsideCity: tcsService.isOutsideCity(shippingAddress.city),
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
