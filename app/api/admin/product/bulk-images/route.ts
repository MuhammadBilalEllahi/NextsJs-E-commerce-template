import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import Product from "@/models/Product";
import Variant from "@/models/Variant";
import RandomImage from "@/models/RandomImage";

// POST - Apply images to selected products/variants
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      productIds,
      variantIds,
      imageUrls,
      operation,
      category,
      randomCount,
    } = await request.json();

    console.log("productIds", productIds);
    console.log("variantIds", variantIds);
    console.log("imageUrls", imageUrls);
    console.log("operation", operation);
    console.log("category", category);
    console.log("randomCount", randomCount);

    if (!productIds && !variantIds) {
      return NextResponse.json(
        { error: "Product IDs or Variant IDs are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    let imagesToApply: string[] = [];

    console.log("Processing images...");
    console.log("imageUrls exists:", !!imageUrls);
    console.log("imageUrls length:", imageUrls?.length);
    console.log("operation:", operation);

    if (imageUrls && imageUrls.length > 0) {
      // Use provided custom images
      imagesToApply = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      console.log("Using custom images:", imagesToApply);
    } else if (operation === "random") {
      // Get random images based on category from RandomImage collection
      const query: any = { isActive: true };
      if (category && category !== "all") {
        query.category = category;
      }

      console.log("Fetching random images with query:", query);
      console.log("Random count:", randomCount);

      // Get all images matching the criteria
      const allImages = await RandomImage.find(query).lean();
      console.log("Total images found:", allImages.length);

      if (allImages.length === 0) {
        console.log("No random images found in database");
        return NextResponse.json(
          { error: "No random images available in the selected category" },
          { status: 400 }
        );
      }

      // Shuffle and select random images
      const shuffled = allImages.sort(() => 0.5 - Math.random());
      const selectedImages = shuffled.slice(0, randomCount || 2);

      imagesToApply = selectedImages.map((img) => img.url);
      console.log("Selected random images:", imagesToApply);
    }

    if (imagesToApply.length === 0) {
      return NextResponse.json(
        { error: "No images to apply" },
        { status: 400 }
      );
    }

    const results = {
      productsUpdated: 0,
      variantsUpdated: 0,
      errors: [] as string[],
    };

    // Update products
    if (productIds && productIds.length > 0) {
      for (const productId of productIds) {
        try {
          const product = await Product.findById(productId);
          if (product) {
            if (operation === "replace") {
              product.images = imagesToApply;
            } else if (operation === "add") {
              // Add new images without duplicates
              const existingImages = product.images || [];
              const newImages = imagesToApply.filter(
                (img) => !existingImages.includes(img)
              );
              product.images = [...existingImages, ...newImages];
            }
            await product.save();
            results.productsUpdated++;
          }
        } catch (error: any) {
          results.errors.push(
            `Failed to update product ${productId}: ${error.message}`
          );
        }
      }
    }

    // Update variants
    if (variantIds && variantIds.length > 0) {
      for (const variantId of variantIds) {
        try {
          const variant = await Variant.findById(variantId);
          if (variant) {
            if (operation === "replace") {
              variant.images = imagesToApply;
            } else if (operation === "add") {
              // Add new images without duplicates
              const existingImages = variant.images || [];
              const newImages = imagesToApply.filter(
                (img) => !existingImages.includes(img)
              );
              variant.images = [...existingImages, ...newImages];
            }
            await variant.save();
            results.variantsUpdated++;
          }
        } catch (error: any) {
          results.errors.push(
            `Failed to update variant ${variantId}: ${error.message}`
          );
        }
      }
    }

    return NextResponse.json({
      message: "Images applied successfully",
      results,
    });
  } catch (error: any) {
    console.error("Error applying images:", error);
    return NextResponse.json(
      { error: "Failed to apply images", details: error.message },
      { status: 500 }
    );
  }
}
