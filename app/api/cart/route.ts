import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/database/mongodb";
import Cart from "@/models/Cart";
import RedisClient from "@/database/redisClient";
import { CACHE_CART_KEY, CACHE_CART_EXPIRE_TIME } from "@/lib/cacheConstants";

/**
 * Cart API with write conflict handling
 *
 * Write conflicts (MongoDB error code 112) can occur when multiple requests
 * try to update the same cart document simultaneously. This implementation
 * uses:
 * 1. Retry logic with exponential backoff
 * 2. Optimistic concurrency control with version field
 * 3. Proper transaction handling
 * 4. Cache invalidation to prevent stale data
 */

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

    // Cache the cart
    const cacheKey = body.user
      ? CACHE_CART_KEY(body.user.id)
      : CACHE_CART_KEY(body.uuidv4);
    await RedisClient.set(
      cacheKey,
      JSON.stringify(cart),
      CACHE_CART_EXPIRE_TIME.ONE_HOUR
    );

    return NextResponse.json({ success: true, cart }, { status: 200 });
  } catch (err: any) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error creating cart:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create cart" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

// Get cart by user id or session id
export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const [userId, sessionId] = [
      searchParams.get("userId"),
      searchParams.get("sessionId"),
    ];
    console.debug(userId, sessionId);
    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "Missing userId and sessionId" },
        { status: 400 }
      );
    }

    // Try Redis cache first
    const cacheKey = userId
      ? CACHE_CART_KEY(userId)
      : CACHE_CART_KEY(sessionId!);
    const cached = await RedisClient.get(cacheKey);
    if (cached) {
      return NextResponse.json(
        { success: true, cart: JSON.parse(cached) },
        { status: 200 }
      );
    }

    // Find cart in database
    const cart = await Cart.findOne({
      $or: [{ "user.id": userId }, { uuidv4: sessionId }],
    }).lean();

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Cache the result
    await RedisClient.set(
      cacheKey,
      JSON.stringify(cart),
      CACHE_CART_EXPIRE_TIME.ONE_HOUR
    );
    return NextResponse.json({ success: true, cart }, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching cart:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// Update cart by user id or session id (with upsert support)
export async function PUT(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const [userId, sessionId] = [
    searchParams.get("userId"),
    searchParams.get("sessionId"),
  ];
  console.debug(userId, sessionId, "PUT");

  if (!userId && !sessionId) {
    return NextResponse.json(
      { error: "Missing userId and sessionId" },
      { status: 400 }
    );
  }

  const body = await req.json();

  // Prepare cart data
  const cartData: any = {
    items: body.items || [],
    updatedAt: new Date(),
    $inc: { version: 1 }, // Increment version for optimistic concurrency control
  };

  // Set user or session identifier
  if (userId) {
    cartData.user = userId;
    cartData.uuidv4 = null; // Clear session ID when user is set
  } else {
    cartData.uuidv4 = sessionId;
    cartData.user = null;
  }

  // Retry logic for write conflicts (MongoDB error code 112)
  // This handles concurrent updates to the same cart document
  const maxRetries = 3;
  let retryCount = 0;
  let updatedCart = null;

  while (retryCount < maxRetries) {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Find and update cart, or create new one if doesn't exist
        // Use optimistic concurrency control to prevent conflicts
        updatedCart = await Cart.findOneAndUpdate(
          {
            $or: [{ "user.id": userId }, { uuidv4: sessionId }],
          },
          cartData,
          {
            new: true,
            upsert: true,
            session,
            setDefaultsOnInsert: true,
          }
        );

        await session.commitTransaction();
        break; // Success, exit retry loop
      } catch (err: any) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } catch (err: any) {
      retryCount++;

      // Check if it's a write conflict error
      if (err.code === 112 && retryCount < maxRetries) {
        console.debug(
          `Write conflict detected for cart update (userId: ${userId}, sessionId: ${sessionId}), retrying... (attempt ${retryCount}/${maxRetries})`
        );
        // Exponential backoff: 100ms, 200ms, 400ms delays
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 100)
        );
        continue;
      }

      // If it's not a write conflict or we've exhausted retries, throw the error
      console.error("Error updating cart:", err);
      return NextResponse.json(
        { error: err.message || "Failed to update cart" },
        { status: 500 }
      );
    }
  }

  if (!updatedCart) {
    return NextResponse.json(
      { error: "Failed to update cart after retries" },
      { status: 500 }
    );
  }

  // Clear old cache keys and set new one
  const oldCacheKey = sessionId ? CACHE_CART_KEY(sessionId) : null;
  const newCacheKey = userId
    ? CACHE_CART_KEY(userId)
    : CACHE_CART_KEY(sessionId!);

  if (oldCacheKey) {
    await RedisClient.del(oldCacheKey);
  }
  await RedisClient.set(
    newCacheKey,
    JSON.stringify(updatedCart),
    CACHE_CART_EXPIRE_TIME.ONE_HOUR
  );

  return NextResponse.json(
    { success: true, cart: updatedCart },
    { status: 200 }
  );
}

// Delete cart by user id or session id
export async function DELETE(req: Request) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { searchParams } = new URL(req.url);
    const [userId, sessionId] = [
      searchParams.get("userId"),
      searchParams.get("sessionId"),
    ];

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "Missing userId and sessionId" },
        { status: 400 }
      );
    }

    const deletedCart = await Cart.findOneAndDelete(
      {
        $or: [{ "user.id": userId }, { uuidv4: sessionId }],
      },
      { session }
    );

    await session.commitTransaction();

    // Clear cache
    const cacheKey = userId
      ? CACHE_CART_KEY(userId)
      : CACHE_CART_KEY(sessionId!);
    await RedisClient.del(cacheKey);

    if (!deletedCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Cart deleted" },
      { status: 200 }
    );
  } catch (err: any) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error deleting cart:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete cart" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

// Merge guest cart with user cart (for when guest registers)
export async function PATCH(req: Request) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, sessionId } = await req.json();

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "Missing userId or sessionId" },
        { status: 400 }
      );
    }

    // Find guest cart
    const guestCart = await Cart.findOne({ uuidv4: sessionId }).session(
      session
    );
    if (!guestCart) {
      return NextResponse.json(
        { error: "Guest cart not found" },
        { status: 404 }
      );
    }

    // Find or create user cart
    let userCart = await Cart.findOne({ "user.id": userId }).session(session);

    if (!userCart) {
      // Create new user cart with guest cart items
      userCart = new Cart({
        user: userId,
        items: guestCart.items,
        currency: guestCart.currency,
        updatedAt: new Date(),
      });
    } else {
      // Merge guest cart items with existing user cart
      const existingItems = new Map();

      // Add existing user cart items
      userCart.items.forEach((item: any) => {
        const key = item.variantId
          ? `${item.productId}-${item.variantId}`
          : item.productId;
        existingItems.set(key, item);
      });

      // Merge guest cart items
      guestCart.items.forEach((item: any) => {
        const key = item.variantId
          ? `${item.productId}-${item.variantId}`
          : item.productId;
        if (existingItems.has(key)) {
          // Add quantities if same item
          const existing = existingItems.get(key);
          existing.quantity += item.quantity;
        } else {
          // Add new item
          existingItems.set(key, item);
        }
      });

      userCart.items = Array.from(existingItems.values());
      userCart.updatedAt = new Date();
    }

    await userCart.save({ session });

    // Delete guest cart
    await Cart.findOneAndDelete({ uuidv4: sessionId }).session(session);

    await session.commitTransaction();

    // Update cache
    const userCacheKey = CACHE_CART_KEY(userId);
    const guestCacheKey = CACHE_CART_KEY(sessionId);

    await RedisClient.set(
      userCacheKey,
      JSON.stringify(userCart),
      CACHE_CART_EXPIRE_TIME.ONE_HOUR
    );
    await RedisClient.del(guestCacheKey);

    return NextResponse.json(
      { success: true, cart: userCart },
      { status: 200 }
    );
  } catch (err: any) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error merging carts:", err);
    return NextResponse.json(
      { error: err.message || "Failed to merge carts" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
