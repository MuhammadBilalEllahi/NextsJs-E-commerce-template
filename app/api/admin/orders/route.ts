import { NextRequest, NextResponse } from "next/server"
import Order from "@/models/Order"
import dbConnect from "@/database/mongodb"
import { restoreStockForCancelledOrder } from "@/lib/utils/stockManager"

export async function GET(req: NextRequest) {
    try {
        await dbConnect()
        
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        
        // Build query
        const query: any = {}
        
        if (status) {
            query.status = status
        }
        
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { refId: { $regex: search, $options: 'i' } },
                { 'contact.email': { $regex: search, $options: 'i' } },
                { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.lastName': { $regex: search, $options: 'i' } }
            ]
        }
        
        // Get orders with pagination
        const orders = await Order.find(query)
            .populate('user', 'email firstName lastName')
            .populate('items.product', 'title image')
            .populate('items.variant', 'label')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
        
        // Get total count for pagination
        const total = await Order.countDocuments(query)
        
        // Format orders for admin display
        const formattedOrders = orders.map(order => ({
            id: order._id.toString(),
            orderId: order.orderId || order._id.toString().slice(-8).toUpperCase(),
            refId: order.refId || order._id.toString().slice(-8).toUpperCase(),
            date: new Date(order.createdAt).toLocaleDateString(),
            customer: order.user 
                ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email
                : `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim() || order.contact.email,
            email: order.contact.email,
            total: order.total,
            itemsCount: order.items.length,
            shippingMethod: order.shippingMethod,
            shippingFee: order.shippingFee,
            tcsFee: order.tcsFee || 0,
            status: order.status,
            payment: order.payment.method,
            paymentStatus: order.payment.status,
            tracking: order.tracking || '',
            cancellationReason: order.cancellationReason || '',
            history: order.history || [],
            address: order.shippingAddress,
            billingAddress: order.billingAddress,
            items: order.items.map(item => ({
                productTitle: item.product?.title || 'Unknown Product',
                variantLabel: item.variant?.label || '',
                quantity: item.quantity,
                price: item.priceAtPurchase
            }))
        }))
        
        return NextResponse.json({
            orders: formattedOrders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
        
    } catch (error) {
        console.error("Failed to fetch orders:", error)
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        )
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect()
        
        const { orderId, status, tracking, cancellationReason, changedBy } = await req.json()
        
        if (!orderId || !status) {
            return NextResponse.json(
                { error: "Order ID and status are required" },
                { status: 400 }
            )
        }
        
        // Get current order to check if status is changing
        const currentOrder = await Order.findById(orderId)
        if (!currentOrder) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }
        
        const updateData: any = { status }
        if (tracking) {
            updateData.tracking = tracking
        }
        
        // Add cancellation reason if cancelling
        if (status === 'cancelled' && cancellationReason) {
            updateData.cancellationReason = cancellationReason
        }
        
        // Add history entry if status is changing
        if (currentOrder.status !== status) {
            const historyEntry = {
                status,
                changedAt: new Date(),
                changedBy: changedBy || 'admin',
                reason: status === 'cancelled' ? cancellationReason || 'Order cancelled by admin' : `Status changed to ${status}`
            }
            
            updateData.$push = { history: historyEntry }
            
            // If cancelling an order, restore stock
            if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
                try {
                    await restoreStockForCancelledOrder(orderId)
                } catch (error) {
                    console.error('Failed to restore stock for cancelled order:', error)
                    // Continue with order cancellation even if stock restoration fails
                }
            }
        }
        
        const order = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        )
        
        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }
        
        return NextResponse.json({ 
            message: "Order updated successfully",
            order: {
                id: order._id.toString(),
                status: order.status,
                tracking: order.tracking,
                cancellationReason: order.cancellationReason
            }
        })
        
    } catch (error) {
        console.error("Failed to update order:", error)
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        )
    }
}
