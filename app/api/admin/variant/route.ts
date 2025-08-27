import dbConnect from "@/lib/mongodb";
import Variant from "@/models/Variant";
import { variantZodSchema } from "@/models/Variant";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/api/aws/aws";

export async function POST(req: Request) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const formData = await req.formData();

    const raw = {
      product: formData.get("product")?.toString(),
      sku: formData.get("sku")?.toString(),
      label: formData.get("label")?.toString(),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      discount: Number(formData.get("discount") || 0),
      isActive: formData.get("isActive")?.toString() === "true" || true,
      isOutOfStock: formData.get("isOutOfStock")?.toString() === "true" || false,
    };

    const parsed = variantZodSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { product, sku, label, price, stock, discount, isActive, isOutOfStock } = parsed.data;
// product is the id of the product

    const newVariant = await Variant.create(
      [{ product, sku, label, price, stock, discount, isActive, isOutOfStock }],
      { session }
    ).then((res: any) => res[0]);


    const productUpdate = await Product.findByIdAndUpdate(product, { $push: { variants: newVariant._id } }, { session });

    await session.commitTransaction();
    return NextResponse.json({ message: "Variant created successfully", variant: newVariant }, { status: 201 });


  }

  catch (err: any) {
    await session.abortTransaction();
    console.error("Error creating variant:", err);
    return NextResponse.json({ error: err.message || "Failed to create variant" }, { status: 500 });
  }
  finally {
    session.endSession();
  }
}


export async function PUT(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const formData = await req.formData();
        const id = formData.get("id")?.toString();
        const isActive = formData.get("isActive")?.toString() === "true";
        const isOutOfStock = formData.get("isOutOfStock")?.toString() === "true";
        const stock = Number(formData.get("stock"));
        const price = Number(formData.get("price"));
        const discount = Number(formData.get("discount"));
        const label = formData.get("label")?.toString();
        const images = formData.getAll("images") as File[];

        const variant = await Variant.findById(id).session(session);
        if (!variant) {
            return NextResponse.json({ error: "Variant not found" }, { status: 404 });
        }

        // Handle image uploads if any
        let uploadedImages: string[] = [];
        if (images && images.length > 0) {
            for (const file of images) {
                if (file instanceof Blob) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const url = await uploadFileToS3(
                        {
                            buffer,
                            originalFilename: (file as any).name || `${Date.now()}.jpg`,
                            mimetype: file.type,
                        },
                        `variants/${id}`
                    );
                    uploadedImages.push(url);
                }
            }
        }

        // Merge existing images with new ones
        const finalImages = uploadedImages.length > 0 ? uploadedImages : variant.images;

        const updatedVariant = await Variant.findByIdAndUpdate(id, { 
            $set: { 
                isActive, 
                isOutOfStock, 
                stock, 
                price, 
                discount, 
                label, 
                images: finalImages 
            } 
        }, { session, new: true });

        await session.commitTransaction();
        return NextResponse.json({ variant: updatedVariant }, { status: 200 });
    }

    catch (err: any) {
        await session.abortTransaction();
        console.error("Error updating variant:", err);
        return NextResponse.json({ error: err.message || "Failed to update variant" }, { status: 500 });
    }
    finally {
        session.endSession();
    }
}


export async function GET(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
            const formData = await req.formData();
        const id = formData.get("id")?.toString();
        const productId = formData.get("productId")?.toString();

        if(id){
            const variant = await Variant.findById(id).session(session);
            return NextResponse.json({ variant }, { status: 200 });
        }
        if(productId){
            const variants = await Variant.find({product: productId}).session(session);
            return NextResponse.json({ variants }, { status: 200 });
        }
        return NextResponse.json({ error: "No id or productId provided" }, { status: 400 });
    }

    catch (err: any) {
        await session.abortTransaction();
        console.error("Error getting variant:", err);
        return NextResponse.json({ error: err.message || "Failed to get variant" }, { status: 500 });
    }
    finally {
        session.endSession();
    }
}


export async function DELETE(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const formData = await req.formData();
        const id = formData.get("id")?.toString();
        if (!id) {
            return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
        }

        const variant = await Variant.findByIdAndDelete(id).session(session);
        const product = await Product.findByIdAndUpdate(variant?.product, { $pull: { variants: id } }, { session });

        if (!variant || !product) {
            return NextResponse.json({ error: "Variant or product not found" }, { status: 404 });
        }

        await session.commitTransaction();
        return NextResponse.json({ message: "Variant deleted successfully", variant: variant }, { status: 200 });
    }

    catch (err: any) {
        await session.abortTransaction();
        console.error("Error deleting variant:", err);
        return NextResponse.json({ error: err.message || "Failed to delete variant" }, { status: 500 });
    }
    finally {
        session.endSession();
    }
}