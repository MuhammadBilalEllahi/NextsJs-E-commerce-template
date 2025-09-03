import { NextRequest, NextResponse } from "next/server"
import ShippingMethod from "@/models/ShippingMethod"
import dbConnect from "@/database/mongodb"

export async function GET(req: NextRequest) {
    try {
        await dbConnect()
        
        const { searchParams } = new URL(req.url)
        const city = searchParams.get('city')
        const state = searchParams.get('state') || 'Punjab'
        const country = searchParams.get('country') || 'Pakistan'
        const subtotal = parseFloat(searchParams.get('subtotal') || '0')
        
        // Get active shipping methods
        const shippingMethods = await ShippingMethod.find({ isActive: true }).lean()
        
        // Calculate shipping costs for each method
        const methodsWithCosts = shippingMethods.map((method: { defaultShippingFee: any; defaultTcsFee: any; defaultEstimatedDays: any; locations: any[]; freeShippingThreshold: number; _id: any; name: any; type: any; description: any; restrictions: any }) => {
            let shippingFee = method.defaultShippingFee
            let tcsFee = method.defaultTcsFee
            let estimatedDays = method.defaultEstimatedDays
            let isAvailable = true
            
            // Find specific location pricing
            if (city && method.locations) {
                const location = method.locations.find((loc: { city: string; isAvailable: any }) => 
                    loc.city.toLowerCase() === city.toLowerCase() && 
                    loc.isAvailable
                )
                
                if (location) {
                    shippingFee = location.shippingFee
                    tcsFee = location.tcsFee
                    estimatedDays = location.estimatedDays
                }
            }
            
            // Check if free shipping applies
            if (method.freeShippingThreshold > 0 && subtotal >= method.freeShippingThreshold) {
                shippingFee = 0
            }
            
            return {
                id: method._id,
                name: method.name,
                type: method.type,
                shippingFee,
                tcsFee,
                totalFee: shippingFee + tcsFee,
                estimatedDays,
                isAvailable,
                description: method.description,
                restrictions: method.restrictions
            }
        })
        
        return NextResponse.json({ 
            methods: methodsWithCosts,
            city,
            state,
            country
        })
        
    } catch (error) {
        console.error('Error fetching shipping methods:', error)
        return NextResponse.json(
            { error: "Failed to fetch shipping methods" }, 
            { status: 500 }
        )
    }
}

