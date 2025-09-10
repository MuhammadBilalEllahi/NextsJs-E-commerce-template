import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import TCSOrder from "@/models/TCSOrder";
import Order from "@/models/Order";
import tcsService from "@/lib/api/tcs/tcsService";

// Get TCS tracking information for customer
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const refId = searchParams.get('refId');
    
    if (!orderId && !refId) {
      return NextResponse.json(
        { error: 'Order ID or Reference ID is required' },
        { status: 400 }
      );
    }
    
    // Find the main order first
    let order;
    if (orderId) {
      order = await Order.findOne({ orderId });
    } else if (refId) {
      order = await Order.findOne({ refId });
    }
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Find TCS order
    const tcsOrder = await TCSOrder.findOne({ order: order._id });
    
    if (!tcsOrder) {
      return NextResponse.json({
        success: true,
        data: {
          order: {
            orderId: order.orderId,
            refId: order.refId,
            status: order.status,
            tracking: order.tracking,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          },
          tcsOrder: null,
          message: 'No TCS order found for this order'
        }
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
      console.error('Failed to get latest TCS tracking:', error);
      // Continue with cached data
    }
    
    // Prepare response data
    const responseData = {
      order: {
        orderId: order.orderId,
        refId: order.refId,
        status: order.status,
        tracking: order.tracking,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        history: order.history
      },
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
        lastApiCall: tcsOrder.lastApiCall
      },
      latestTracking: latestTracking,
      deliveryInfo: {
        isOutsideLahore: tcsService.isOutsideLahore(order.shippingAddress.city),
        estimatedDays: tcsService.getEstimatedDeliveryDays(order.shippingAddress.city),
        shippingMethod: order.shippingMethod
      }
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Failed to get TCS tracking:', error);
    return NextResponse.json(
      { error: 'Failed to get tracking information' },
      { status: 500 }
    );
  }
}

