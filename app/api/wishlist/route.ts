import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/database/mongodb";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import Variant from "@/models/Variant";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { getOrCreateGuestId } from "@/lib/utils/uuid";

// GET - Get user's wishlist
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // Determine user identifier
    let userId = null;
    let guestSessionId = null;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (sessionId) {
      guestSessionId = sessionId;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let query: any = { isActive: true };
    if (userId) {
      query.user = userId;
    } else {
      query.sessionId = guestSessionId;
    }

    const wishlistItems = await Wishlist.find(query)
      .populate({
        path: "product",
        populate: {
          path: "variants",
          match: { isActive: true },
        },
      })
      .populate("variant")
      .sort({ addedAt: -1 })
      .lean();

    // Format the response with product details and stock status
    const formattedWishlist = wishlistItems.map((item) => {
      const product = item.product as any;
      const variant = item.variant as any;

      // Check if product is out of stock
      let isOutOfStock = false;
      let availableStock = 0;

      if (variant) {
        // If specific variant is selected
        isOutOfStock = variant.isOutOfStock || variant.stock <= 0;
        availableStock = variant.stock || 0;
      } else {
        // Check product's variants for stock
        const activeVariants =
          product.variants?.filter((v: any) => v.isActive) || [];
        if (activeVariants.length === 0) {
          isOutOfStock = true;
        } else {
          const totalStock = activeVariants.reduce(
            (sum: number, v: any) => sum + (v.stock || 0),
            0
          );
          isOutOfStock = totalStock <= 0;
          availableStock = totalStock;
        }
      }

      return {
        id: item._id,
        productId: product._id,
        productSlug: product.slug,
        productName: product.name,
        productImage: product.images?.[0] || "/placeholder.svg",
        productPrice: variant ? variant.price : product.price,
        variantId: variant?._id || null,
        variantLabel: variant?.label || null,
        isOutOfStock,
        availableStock,
        addedAt: item.addedAt,
      };
    });

    return NextResponse.json({
      success: true,
      wishlist: formattedWishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { productId, variantId, sessionId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Determine user identifier
    let userId = null;
    let guestSessionId = null;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (sessionId) {
      guestSessionId = sessionId;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If variantId is provided, check if variant exists and belongs to product
    if (variantId) {
      const variant = await Variant.findOne({
        _id: variantId,
        product: productId,
      });
      if (!variant) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 }
        );
      }
    }

    // Check if item already exists in wishlist
    let query: any = { product: productId };
    if (userId) {
      query.user = userId;
    } else {
      query.sessionId = guestSessionId;
    }

    const existingItem = await Wishlist.findOne(query);

    if (existingItem) {
      // Update existing item
      existingItem.variant = variantId || null;
      existingItem.isActive = true;
      existingItem.addedAt = new Date();
      await existingItem.save();

      return NextResponse.json({
        success: true,
        message: "Wishlist item updated",
        item: existingItem,
      });
    }

    // Create new wishlist item
    const wishlistItem = new Wishlist({
      user: userId,
      sessionId: guestSessionId,
      product: productId,
      variant: variantId || null,
      isActive: true,
    });

    await wishlistItem.save();

    return NextResponse.json({
      success: true,
      message: "Item added to wishlist",
      item: wishlistItem,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add item to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const sessionId = searchParams.get("sessionId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Determine user identifier
    let userId = null;
    let guestSessionId = null;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (sessionId) {
      guestSessionId = sessionId;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let query: any = { product: productId };
    if (userId) {
      query.user = userId;
    } else {
      query.sessionId = guestSessionId;
    }

    const result = await Wishlist.findOneAndUpdate(
      query,
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Wishlist item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove item from wishlist" },
      { status: 500 }
    );
  }
}
