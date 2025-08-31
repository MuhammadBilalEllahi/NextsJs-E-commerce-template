import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/database/mongodb";
import Cart from "@/models/Cart";
import RedisClient from "@/database/redisClient";
import { CACHE_CART_KEY, CACHE_CART_EXPIRE_TIME } from "@/lib/cacheConstants";
// Create a new cart
export async function POST(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const body = await req.json();
        const cart = new Cart(body);
        await cart.save();
        await session.commitTransaction();
        await RedisClient.set(CACHE_CART_KEY(body.user._id), JSON.stringify(cart), CACHE_CART_EXPIRE_TIME.ONE_HOUR);
        return NextResponse.json({ success: true, cart }, { status: 200 });
    } catch (err: any) {
        if (session) {
            await session.abortTransaction();
        }
        console.error("Error creating cart:", err);
        return NextResponse.json({ error: err.message || "Failed to create cart" }, { status: 500 });
    } finally {
        session.endSession();
    }
}

// Get cart by user id (expects ?userId=xxx in query)
export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const [userId, sessionId] = [searchParams.get("userId"), searchParams.get("sessionId")];

        if (!userId && !sessionId) {
            return NextResponse.json({ error: "Missing userId and sessionId" }, { status: 400 });
        }

        // Try Redis cache first
        const cached = await RedisClient.get(CACHE_CART_KEY(userId || sessionId));
        if (cached) {
            return NextResponse.json({ success: true, cart: JSON.parse(cached) }, { status: 200 });
        }

        const cart = await Cart.findOne({ $or:[{ "user._id": userId }, { uuidv4: sessionId }] }).lean();
        if (!cart) {
            return NextResponse.json({ error: "Cart not found" }, { status: 404 });
        }

            await RedisClient.set(CACHE_CART_KEY(userId || sessionId), JSON.stringify(cart), CACHE_CART_EXPIRE_TIME.ONE_HOUR);
        return NextResponse.json({ success: true, cart }, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching cart:", err);
        return NextResponse.json({ error: err.message || "Failed to fetch cart" }, { status: 500 });
    }
}

// Update cart by user id (expects ?userId=xxx in query)
export async function PUT(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { searchParams } = new URL(req.url);
        const [userId, sessionId] = [searchParams.get("userId"), searchParams.get("sessionId")];
        if (!userId && !sessionId) {
            return NextResponse.json({ error: "Missing userId and sessionId" }, { status: 400 });
        }
        const body = await req.json();
        const updatedCart = await Cart.findOneAndUpdate(
            { $or: [{ "user._id": userId }, { uuidv4: sessionId }] },
            body,
            { new: true, upsert: true, session }
        );
        await session.commitTransaction();
        await RedisClient.set(CACHE_CART_KEY(userId || sessionId), JSON.stringify(updatedCart), CACHE_CART_EXPIRE_TIME.ONE_HOUR);
        return NextResponse.json({ success: true, cart: updatedCart }, { status: 200 });
    } catch (err: any) {
        if (session) {
            await session.abortTransaction();
        }
        console.error("Error updating cart:", err);
        return NextResponse.json({ error: err.message || "Failed to update cart" }, { status: 500 });
    } finally {
        session.endSession();
    }
}

// Delete cart by user id (expects ?userId=xxx in query)
export async function DELETE(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { searchParams } = new URL(req.url);
        const [userId, sessionId] = [searchParams.get("userId"), searchParams.get("sessionId")];
        if (!userId && !sessionId) {
            return NextResponse.json({ error: "Missing userId and sessionId" }, { status: 400 });
        }
        const deletedCart = await Cart.findOneAndDelete({ $or: [{ "user._id": userId }, { uuidv4: sessionId }] }, { session });
        await session.commitTransaction();
        await RedisClient.del(CACHE_CART_KEY(userId || sessionId), CACHE_CART_EXPIRE_TIME.ONE_HOUR);
        if (!deletedCart) {
            return NextResponse.json({ error: "Cart not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Cart deleted" }, { status: 200 });
    } catch (err: any) {
        if (session) {
            await session.abortTransaction();
        }
        console.error("Error deleting cart:", err);
        return NextResponse.json({ error: err.message || "Failed to delete cart" }, { status: 500 });
    } finally {
        session.endSession();
    }
}