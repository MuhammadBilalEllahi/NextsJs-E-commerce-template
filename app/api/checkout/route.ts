import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/database/mongodb"
import Order from "@/models/Order"
import { generateOrderIds } from "@/lib/utils/orderIds"
import { ORDER_STATUS, ORDER_PAYMENT_STATUS, PAYMENT_TYPE, ORDER_TYPE } from "@/models/constants"
import { checkStockAvailability } from "@/lib/utils/stockManager"

export async function POST(req: NextRequest) {
    try {
        await dbConnect()
        const body = await req.json()
        
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
            shippingMethod
        } = body
        
        // Check stock availability before creating order
        const stockCheck = await checkStockAvailability(items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.qty
        })))
        
        if (!stockCheck.available) {
            return NextResponse.json(
                { 
                    error: "Insufficient stock", 
                    details: stockCheck.errors 
                }, 
                { status: 400 }
            )
        }
        
        // Generate sequential order ID and ref ID using counters
        const { orderId, refId } = await generateOrderIds()
        
        // Create order
        const order = new Order({
            orderId,
            refId,
            user: userId || null,
            contact: {
                email: contact.email,
                phone: contact.phone,
                marketingOptIn: contact.marketingOptIn || false
            },
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            shippingMethod: shippingMethod,
            payment: {
                method: PAYMENT_TYPE.COD,
                status: ORDER_PAYMENT_STATUS.PENDING,
                transactionId: ""
            },
            items: items.map((item: any) => ({
                product: item.productId,
                variant: item.variantId || null,
                quantity: item.qty,
                priceAtPurchase: item.price,
                label: item.variantLabel || ""
            })),
            subtotal,
            shippingFee,
            total,
            status: ORDER_STATUS.PENDING,
            history: [{
                status: ORDER_STATUS.PENDING,
                changedAt: new Date(),
                changedBy: userId ? userId : "system",
                reason: "Order created"
            }]
        })
        
        await order.save()
        
        return NextResponse.json({ 
            success: true,
            orderId,
            refId,
            order: order._id
        })
        
    } catch (error) {
        console.error('Checkout error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: "Checkout failed", details: errorMessage }, 
            { status: 500 }
        )
    }
}