import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/database/mongodb"
import ShippingMethod from "@/models/ShippingMethod"

export async function GET(req: NextRequest) {
    try {
        await dbConnect()
        const methods = await ShippingMethod.find({}).sort({ createdAt: -1 }).lean()
        return NextResponse.json({ methods })
    } catch (error) {
        console.error('Error fetching shipping methods:', error)
        return NextResponse.json(
            { error: "Failed to fetch shipping methods" }, 
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect()
        const body = await req.json()
        
        const method = new ShippingMethod(body)
        await method.save()
        
        return NextResponse.json({ 
            success: true, 
            method: method._id 
        })
        
    } catch (error) {
        console.error('Error creating shipping method:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: "Failed to create shipping method", details: errorMessage }, 
            { status: 500 }
        )
    }
}

