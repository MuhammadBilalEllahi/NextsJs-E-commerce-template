import Product from "@/models/Product"
import Variant from "@/models/Variant"
import Order from "@/models/Order"
import dbConnect from "@/database/mongodb"

/**
 * Restore stock for cancelled order items
 * This function increases the stock by the quantity that was originally ordered
 */
export async function restoreStockForCancelledOrder(orderId: string): Promise<void> {
    try {
        await dbConnect()
        
        // Get the order with populated items
        const order = await Order.findById(orderId)
            .populate('items.product')
            .populate('items.variant')
            .lean()
        
        if (!order) {
            throw new Error('Order not found')
        }
        
        // Process each item in the order
        for (const item of order.items) {
            if (item.variant) {
                // If item has a variant, restore stock to the variant
                await Variant.findByIdAndUpdate(
                    item.variant,
                    { 
                        $inc: { stock: item.quantity },
                        $set: { 
                            isOutOfStock: false,
                            updatedAt: new Date()
                        }
                    }
                )
                console.log(`Restored ${item.quantity} units to variant ${item.variant}`)
            } else if (item.product) {
                // If no variant, we might need to handle product-level stock
                // For now, we'll just log this case as products don't have stock field
                console.log(`Product ${item.product} has no variant stock to restore`)
            }
        }
        
        console.log(`Stock restored for cancelled order ${orderId}`)
        
    } catch (error) {
        console.error('Error restoring stock for cancelled order:', error)
        throw error
    }
}

/**
 * Decrease stock when order is confirmed
 * This function decreases the stock by the ordered quantity
 */
export async function decreaseStockForOrder(orderId: string): Promise<void> {
    try {
        await dbConnect()
        
        // Get the order with populated items
        const order = await Order.findById(orderId)
            .populate('items.product')
            .populate('items.variant')
            .lean()
        
        if (!order) {
            throw new Error('Order not found')
        }
        
        // Process each item in the order
        for (const item of order.items) {
            if (item.variant) {
                // Check if there's enough stock
                const variant = await Variant.findById(item.variant)
                if (!variant) {
                    throw new Error(`Variant ${item.variant} not found`)
                }
                
                if (variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock for variant ${variant.label}. Available: ${variant.stock}, Required: ${item.quantity}`)
                }
                
                // Decrease stock
                await Variant.findByIdAndUpdate(
                    item.variant,
                    { 
                        $inc: { stock: -item.quantity },
                        $set: { 
                            isOutOfStock: variant.stock - item.quantity <= 0,
                            updatedAt: new Date()
                        }
                    }
                )
                console.log(`Decreased ${item.quantity} units from variant ${item.variant}`)
            }
        }
        
        console.log(`Stock decreased for order ${orderId}`)
        
    } catch (error) {
        console.error('Error decreasing stock for order:', error)
        throw error
    }
}

/**
 * Check if there's sufficient stock for an order
 */
export async function checkStockAvailability(orderItems: Array<{
    productId: string
    variantId?: string
    quantity: number
}>): Promise<{ available: boolean; errors: string[] }> {
    try {
        await dbConnect()
        
        const errors: string[] = []
        
        for (const item of orderItems) {
            if (item.variantId) {
                const variant = await Variant.findById(item.variantId)
                if (!variant) {
                    errors.push(`Variant ${item.variantId} not found`)
                    continue
                }
                
                if (variant.stock < item.quantity) {
                    errors.push(`Insufficient stock for ${variant.label}. Available: ${variant.stock}, Required: ${item.quantity}`)
                }
            }
        }
        
        return {
            available: errors.length === 0,
            errors
        }
        
    } catch (error) {
        console.error('Error checking stock availability:', error)
        return {
            available: false,
            errors: ['Error checking stock availability']
        }
    }
}
