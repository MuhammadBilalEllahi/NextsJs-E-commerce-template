import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/database/mongodb";
import Wishlist from "@/models/Wishlist";
import { authOptions } from "@/lib/auth";

// GET - Get all users' wishlists (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    let query: any = { isActive: true };

    // Filter by specific user if provided
    if (userId) {
      query.user = userId;
    }

    // Filter by specific product if provided
    if (productId) {
      query.product = productId;
    }

    const skip = (page - 1) * limit;

    const wishlistItems = await Wishlist.find(query)
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "product",
        populate: {
          path: "variants",
          match: { isActive: true },
        },
      })
      .populate("variant")
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Wishlist.countDocuments(query);

    // Format the response
    const formattedWishlist = wishlistItems.map((item) => {
      const user = item.user as any;
      const product = item.product as any;
      const variant = item.variant as any;

      // Check stock status
      let isOutOfStock = false;
      let availableStock = 0;

      if (variant) {
        isOutOfStock = variant.isOutOfStock || variant.stock <= 0;
        availableStock = variant.stock || 0;
      } else {
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

      // Determine user identifier
      const userIdentifier = user
        ? {
            type: "registered",
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
          }
        : {
            type: "guest",
            sessionId: item.sessionId,
            userName: "Guest User",
            userEmail: `Session: ${item.sessionId}`,
          };

      return {
        id: item._id,
        ...userIdentifier,
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
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist data" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from any user's wishlist (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const wishlistId = searchParams.get("id");
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    await dbConnect();

    let query: any = { isActive: true };

    if (wishlistId) {
      query._id = wishlistId;
    } else if (userId && productId) {
      query.user = userId;
      query.product = productId;
    } else {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
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
      message: "Wishlist item removed",
    });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    return NextResponse.json(
      { error: "Failed to remove wishlist item" },
      { status: 500 }
    );
  }
}
