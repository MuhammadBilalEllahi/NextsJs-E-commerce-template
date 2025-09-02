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
                try {
                    // If item has a variant, restore stock to the variant
                    const result = await Variant.findByIdAndUpdate(
                        item.variant,
                        { 
                            $inc: { stock: item.quantity },
                            $set: { 
                                isOutOfStock: false,
                                updatedAt: new Date()
                            }
                        },
                        { new: true }
                    )
                    
                    if (result) {
                        console.log(`Restored ${item.quantity} units to variant ${item.variant}. New stock: ${result.stock}`)
                    } else {
                        console.error(`Failed to restore stock for variant ${item.variant}`)
                    }
                } catch (error) {
                    console.error(`Error restoring stock for variant ${item.variant}:`, error)
                    throw error
                }
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
 * Decrease stock when order is created
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
                try {
                    // Decrease stock (we already checked availability in checkout)
                    const result = await Variant.findByIdAndUpdate(
                        item.variant,
                        { 
                            $inc: { stock: -item.quantity },
                            $set: { 
                                updatedAt: new Date()
                            }
                        },
                        { new: true }
                    )
                    
                    if (result) {
                        // Update isOutOfStock flag based on new stock level
                        if (result.stock <= 0) {
                            await Variant.findByIdAndUpdate(
                                item.variant,
                                { 
                                    $set: { 
                                        isOutOfStock: true,
                                        updatedAt: new Date()
                                    }
                                }
                            )
                        }
                        console.log(`Decreased ${item.quantity} units from variant ${item.variant}. New stock: ${result.stock}`)
                    } else {
                        console.error(`Failed to decrease stock for variant ${item.variant}`)
                    }
                } catch (error) {
                    console.error(`Error decreasing stock for variant ${item.variant}:`, error)
                    throw error
                }
            } else {
                console.log(`Item has no variant, skipping stock decrease`)
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
