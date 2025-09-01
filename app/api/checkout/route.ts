import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('Checkout request:', body)
        return NextResponse.json({ message: "Checkout successful" })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json({ message: "Checkout failed" }, { status: 500 })
    }
}