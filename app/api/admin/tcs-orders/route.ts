import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import TCSOrder from "@/models/TCSOrder";
import Order from "@/models/Order";
import tcsService from "@/lib/api/tcs/tcsService";
import { TCS_STATUS, ORDER_STATUS } from "@/models/constants";

// Get all TCS orders with pagination and filters
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { consignmentNumber: { $regex: search, $options: 'i' } },
        { customerReferenceNo: { $regex: search, $options: 'i' } },
        { consigneeName: { $regex: search, $options: 'i' } },
        { consigneeMobNo: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tcsOrders = await TCSOrder.find(query)
      .populate('order', 'orderId refId status total createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await TCSOrder.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: tcsOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch TCS orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TCS orders' },
      { status: 500 }
    );
  }
}

// Create TCS order for an existing order
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { orderId, forceCreate = false } = body;
    
    // Find the main order
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if TCS order already exists
    const existingTCSOrder = await TCSOrder.findOne({ order: orderId });
    if (existingTCSOrder && !forceCreate) {
      return NextResponse.json(
        { error: 'TCS order already exists for this order' },
        { status: 400 }
      );
    }
    
    // Check if order should be sent via TCS
    const shouldUseTCS = forceCreate || 
      order.shippingMethod === 'tcs' || 
      tcsService.isOutsideLahore(order.shippingAddress.city);
    
    if (!shouldUseTCS) {
      return NextResponse.json(
        { error: 'Order does not qualify for TCS delivery' },
        { status: 400 }
      );
    }
    
    // Prepare TCS order data
    const tcsOrderData = tcsService.mapOrderToTCSFormat({
      orderId: order.orderId,
      refId: order.refId,
      shippingAddress: order.shippingAddress,
      contact: order.contact,
      items: order.items,
      total: order.total
    });
    
    // Create TCS order via API
    const tcsResponse = await tcsService.createOrder(tcsOrderData);
    
    if (!tcsResponse.CN) {
      return NextResponse.json(
        { error: 'Failed to create TCS order', details: tcsResponse },
        { status: 400 }
      );
    }
    
    // Create TCS order record in database
    const tcsOrder = new TCSOrder({
      order: orderId,
      consignmentNumber: tcsResponse.CN,
      customerReferenceNo: order.refId,
      userName: process.env.TCS_USERNAME || '',
      password: process.env.TCS_PASSWORD || '',
      costCenterCode: process.env.TCS_COST_CENTER_CODE || '',
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
      estimatedDelivery: new Date(Date.now() + tcsService.getEstimatedDeliveryDays(order.shippingAddress.city) * 24 * 60 * 60 * 1000)
    });
    
    await tcsOrder.save();
    
    // Update main order status
    order.status = ORDER_STATUS.CONFIRMED;
    order.tracking = tcsResponse.CN;
    order.history.push({
      status: ORDER_STATUS.CONFIRMED,
      changedAt: new Date(),
      changedBy: 'admin',
      reason: `TCS order created with CN: ${tcsResponse.CN}`
    });
    await order.save();
    
    return NextResponse.json({
      success: true,
      data: tcsOrder,
      message: 'TCS order created successfully'
    });
  } catch (error) {
    console.error('Failed to create TCS order:', error);
    return NextResponse.json(
      { error: 'Failed to create TCS order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

