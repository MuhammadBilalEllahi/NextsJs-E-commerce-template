import { NextResponse } from "next/server";
import Variant from "@/models/Variant";
import Product from "@/models/Product";
import { uploaderFiles } from "@/lib/utils/imageUploader/awsImageUploader";
import dbConnect from "@/database/mongodb";
import mongoose from "mongoose";

export async function POST(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const formData = await req.formData();
        
        const productId = formData.get("product")?.toString();
        const sku = formData.get("sku")?.toString();
        const label = formData.get("label")?.toString();
        const slug = formData.get("slug")?.toString();
        const price = Number(formData.get("price"));
        const stock = Number(formData.get("stock"));
        const discount = Number(formData.get("discount"));
        const isActive = formData.get("isActive") === "true";
        const isOutOfStock = formData.get("isOutOfStock") === "true";

        if (!productId || !sku || price <= 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Generate slug if not provided
        let finalSlug = slug;
        if (!finalSlug) {
            finalSlug = `${sku}-${label || "variant"}`.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
            // Add 6-character random suffix for uniqueness
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            finalSlug = `${finalSlug}-${randomSuffix}`;
        }

        // Check if slug already exists
        const existingVariantBySlug = await Variant.findOne({ slug: finalSlug });
        if (existingVariantBySlug) {
            return NextResponse.json({ error: "A variant with this slug already exists" }, { status: 400 });
        }

        // Check if SKU already exists for this product
        const existingVariantBySku = await Variant.findOne({ product: productId, sku });
        if (existingVariantBySku) {
            return NextResponse.json({ error: "SKU already exists for this product" }, { status: 400 });
        }

        // Create variant
        const variant = await Variant.create([{
            product: productId,
            sku,
            slug: finalSlug,
            label,
            price,
            stock,
            discount,
            isActive,
            isOutOfStock
        }], { session });

        // Handle image uploads
        const images = formData.getAll("images") as File[];
        if (images.length > 0) {
            const uploadedImages = await uploaderFiles('variants', images, variant[0]._id);
            const imageUrls = uploadedImages.map(img => img.url);
            
            await Variant.findByIdAndUpdate(variant[0]._id, {
                images: imageUrls
            }, { session });
        }

        await session.commitTransaction();

        const createdVariant = await Variant.findById(variant[0]._id).populate('product');
        return NextResponse.json({ variant: createdVariant });

    } catch (err: any) {
        await session.abortTransaction();
        console.error("Error creating variant:", err);
        return NextResponse.json({ error: err.message || "Failed to create variant" }, { status: 500 });
    } finally {
        session.endSession();
    }
}

export async function PUT(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const formData = await req.formData();
        
        const variantId = formData.get("id")?.toString();
        if (!variantId) {
            return NextResponse.json({ error: "Missing variant ID" }, { status: 400 });
        }

        const updateData: any = {};
        
        if (formData.has("label")) updateData.label = formData.get("label");
        if (formData.has("price")) updateData.price = Number(formData.get("price"));
        if (formData.has("stock")) updateData.stock = Number(formData.get("stock"));
        if (formData.has("discount")) updateData.discount = Number(formData.get("discount"));
        if (formData.has("isActive")) updateData.isActive = formData.get("isActive") === "true";
        if (formData.has("isOutOfStock")) updateData.isOutOfStock = formData.get("isOutOfStock") === "true";

        // Handle slug updates with validation
        if (formData.has("slug")) {
            const newSlug = formData.get("slug")?.toString();
            if (newSlug && newSlug !== updateData.slug) {
                // Check if new slug already exists
                const existingVariantBySlug = await Variant.findOne({ slug: newSlug, _id: { $ne: variantId } });
                if (existingVariantBySlug) {
                    return NextResponse.json({ error: "A variant with this slug already exists" }, { status: 400 });
                }
                updateData.slug = newSlug;
            }
        }

        // Handle existing images (preserve them)
        const existingImages = formData.getAll("existingImages") as string[];
        
        // Handle new image uploads
        const newImages = formData.getAll("images") as File[];
        if (newImages.length > 0) {
            const uploadedImages = await uploaderFiles('variants', newImages, variantId);
            const newImageUrls = uploadedImages.map(img => img.url);
            
            // Combine existing and new images
            updateData.images = [...existingImages, ...newImageUrls];
        } else if (existingImages.length > 0) {
            // Only preserve existing images if no new ones
            updateData.images = existingImages;
        }

        const updatedVariant = await Variant.findByIdAndUpdate(variantId, updateData, {
            new: true,
            session
        });

        if (!updatedVariant) {
            throw new Error("Variant not found");
        }

        await session.commitTransaction();
        return NextResponse.json({ variant: updatedVariant });

    } catch (err: any) {
        await session.abortTransaction();
        console.error("Error updating variant:", err);
        return NextResponse.json({ error: err.message || "Failed to update variant" }, { status: 500 });
    } finally {
        session.endSession();
    }
}

export async function DELETE(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const formData = await req.formData();
        const variantId = formData.get("id")?.toString();

        if (!variantId) {
            return NextResponse.json({ error: "Missing variant ID" }, { status: 400 });
        }

        const deletedVariant = await Variant.findByIdAndDelete(variantId, { session });
        if (!deletedVariant) {
            return NextResponse.json({ error: "Variant not found" }, { status: 404 });
        }

        await session.commitTransaction();
        return NextResponse.json({ message: "Variant deleted successfully" });

    } catch (err: any) {
        await session.abortTransaction();
        console.error("Error deleting variant:", err);
        return NextResponse.json({ error: err.message || "Failed to delete variant" }, { status: 500 });
    } finally {
        session.endSession();
    }
}