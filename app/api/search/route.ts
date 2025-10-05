import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/database/mongodb";
import { Product as ProductType } from "@/types";

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
    const products = (await Product.find({
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
      .populate("variants", "price")
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()) as any[];

    const formattedProducts = products.map((product: any) => {
      const firstImage = Array.isArray(product?.images)
        ? product.images[0]
        : undefined;

      const brandName =
        (product?.brand && typeof product.brand === "object"
          ? product.brand?.name
          : undefined) || "Dehli Mirch";

      const firstCategory = Array.isArray(product?.categories)
        ? product.categories[0]
        : undefined;

      const categoryName =
        (firstCategory &&
          (typeof firstCategory === "object"
            ? firstCategory?.name
            : firstCategory)) ||
        "spices";

      return {
        id: String(product._id),
        slug: product.slug,
        name: product.name,
        price: product?.variants?.[0]?.price ?? product?.price ?? 0,
        images: product.images,
        image: firstImage,
        brand: brandName,
        ratingAvg: product.ratingAvg || 0,
        reviewCount: product.reviewCount || 0,
        category: categoryName,
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
