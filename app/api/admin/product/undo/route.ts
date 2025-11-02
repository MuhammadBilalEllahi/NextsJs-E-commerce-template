import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import Product from "@/models/Product";
import Variant from "@/models/Variant";
import ImportHistory from "@/models/ImportHistory";
import BrandProducts from "@/models/BrandProducts";
import CategoryProducts from "@/models/CategoryProducts";

// GET - Fetch import history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const histories = await ImportHistory.find({ importedBy: session.user.id })
      .populate("importedBy", "name email")
      .populate("undoneBy", "name email")
      .sort({ importedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ImportHistory.countDocuments({
      importedBy: session.user.id,
    });

    return NextResponse.json({
      histories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching import history:", error);
    return NextResponse.json(
      { error: "Failed to fetch import history", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Undo import (bulk or individual)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { importId, productId, variantId } = await request.json();

    if (!importId) {
      return NextResponse.json(
        { error: "Import ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const importHistory = await ImportHistory.findOne({
      importId,
      importedBy: session.user.id,
      isUndone: false,
    });

    if (!importHistory) {
      return NextResponse.json(
        { error: "Import not found or already undone" },
        { status: 404 }
      );
    }

    let deletedProducts = 0;
    let deletedVariants = 0;
    const errors: string[] = [];

    if (productId) {
      // Undo specific product
      const product = importHistory.products.find(
        (p: {
          productId: any;
          productName: string;
          productSlug: string;
          variants: any[];
        }) => p.productId.toString() === productId
      );

      if (!product) {
        return NextResponse.json(
          { error: "Product not found in this import" },
          { status: 404 }
        );
      }

      try {
        // Delete variants first
        for (const variant of product.variants) {
          try {
            await Variant.findByIdAndDelete(variant.variantId);
            deletedVariants++;
          } catch (variantError: any) {
            errors.push(
              `Failed to delete variant ${variant.variantSku}: ${variantError.message}`
            );
          }
        }

        // Delete product
        await Product.findByIdAndDelete(product.productId);
        deletedProducts++;

        // Update import history
        importHistory.products = importHistory.products.filter(
          (p: {
            productId: any;
            productName: string;
            productSlug: string;
            variants: any[];
          }) => p.productId.toString() !== productId
        );

        // If no products left, mark entire import as undone
        if (importHistory.products.length === 0) {
          importHistory.isUndone = true;
          importHistory.undoneAt = new Date();
          importHistory.undoneBy = session.user.id;
        }

        await importHistory.save();

        return NextResponse.json({
          message: "Product successfully undone",
          deletedProducts,
          deletedVariants,
          errors,
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: "Failed to undo product", details: error.message },
          { status: 500 }
        );
      }
    } else if (variantId) {
      // Undo specific variant
      let foundProduct = null;
      let foundVariant = null;

      for (const product of importHistory.products) {
        const variant = product.variants.find(
          (v: { variantId: any; variantSku: string; variantLabel: string }) =>
            v.variantId.toString() === variantId
        );
        if (variant) {
          foundProduct = product;
          foundVariant = variant;
          break;
        }
      }

      if (!foundVariant) {
        return NextResponse.json(
          { error: "Variant not found in this import" },
          { status: 404 }
        );
      }

      try {
        // Delete variant
        await Variant.findByIdAndDelete(variantId);
        deletedVariants++;

        // Remove variant from product
        await Product.findByIdAndUpdate(foundProduct.productId, {
          $pull: { variants: variantId },
        });

        // Update import history
        foundProduct.variants = foundProduct.variants.filter(
          (v: { variantId: any; variantSku: string; variantLabel: string }) =>
            v.variantId.toString() !== variantId
        );

        // If no variants left for this product, remove the product from history
        if (foundProduct.variants.length === 0) {
          importHistory.products = importHistory.products.filter(
            (p: {
              productId: any;
              productName: string;
              productSlug: string;
              variants: any[];
            }) => p.productId.toString() !== foundProduct.productId.toString()
          );
        }

        // If no products left, mark entire import as undone
        if (importHistory.products.length === 0) {
          importHistory.isUndone = true;
          importHistory.undoneAt = new Date();
          importHistory.undoneBy = session.user.id;
        }

        await importHistory.save();

        return NextResponse.json({
          message: "Variant successfully undone",
          deletedProducts,
          deletedVariants,
          errors,
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: "Failed to undo variant", details: error.message },
          { status: 500 }
        );
      }
    } else {
      // Undo entire import
      try {
        // Delete all products and variants from this import
        for (const product of importHistory.products) {
          try {
            // Delete all variants
            for (const variant of product.variants) {
              await Variant.findByIdAndDelete(variant.variantId);
              deletedVariants++;
            }

            // Delete product
            await Product.findByIdAndDelete(product.productId);
            deletedProducts++;
          } catch (productError: any) {
            errors.push(
              `Failed to delete product ${product.productName}: ${productError.message}`
            );
          }
        }

        // Mark import as undone
        importHistory.isUndone = true;
        importHistory.undoneAt = new Date();
        importHistory.undoneBy = session.user.id;
        await importHistory.save();

        return NextResponse.json({
          message: "Import successfully undone",
          deletedProducts,
          deletedVariants,
          errors,
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: "Failed to undo import", details: error.message },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error("Undo error:", error);
    return NextResponse.json(
      { error: "Failed to undo", details: error.message },
      { status: 500 }
    );
  }
}
