import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/database/mongodb";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Search products by name, description, brand, and categories
    const products = await Product.find({
      $and: [
        { isActive: true, isOutOfStock: false },
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { "brand.name": { $regex: query, $options: "i" } },
            { "categories.name": { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .populate("brand", "name")
      .populate("categories", "name")
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formattedProducts = products.map((product) => ({
      id: String(product._id),
      slug: product.slug,
      title: product.name,
      price: product?.variants?.[0]?.price ?? product?.price ?? 0,
      images: product.images,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : undefined,
      brand: product.brand?.name || "Dehli Mirch",
      rating: product.ratingAvg || 0,
      reviewCount: product.reviewCount || 0,
      category: product.categories?.[0]?.name || "spices",
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

