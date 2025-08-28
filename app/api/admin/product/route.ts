
import Product from "@/models/Product";
import { productZodSchema } from "@/models/Product";
import Variant from "@/models/Variant";
import BrandProducts from "@/models/BrandProducts";
import CategoryProducts from "@/models/CategoryProducts";

import { Brand } from "@/models";




import { uploadFileToS3 } from "@/lib/utils/aws/aws";
import dbConnect from "@/database/mongodb";
import { mkdir, writeFile } from "fs/promises";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import path from "path";
// ============================
//  CREATE PRODUCT
// ============================
export async function POST(req: Request) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const formData = await req.formData();

    const raw = {
      name: formData.get("name")?.toString(),
      description: formData.get("description")?.toString() ?? "",
      ingredients: formData.get("ingredients")?.toString() ?? "",
      price: Number(formData.get("price")),
      discount: Number(formData.get("discount") || 0),
      categories: formData.getAll("categories").map(c => c.toString()),
      brand: formData.get("brand")?.toString(),
      slug: formData.get("slug")?.toString(),
      // images: formData.getAll("images").map(i => i.toString()),
      variants: JSON.parse(formData.get("variants")?.toString() || "[]"),
      isActive: formData.get("isActive")?.toString() === "true",
      isOutOfStock: formData.get("isOutOfStock")?.toString() === "true",
    };

    const parsed = productZodSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    let { name, description, ingredients, price, discount, categories, brand, slug, variants, isActive, isOutOfStock } = parsed.data;

    if (!slug) {
      slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      slug = slug.concat("-", Date.now().toString());
    }

    const newProduct = await Product.create(
      [{ name, description, ingredients, price, discount, slug, categories, isActive, isOutOfStock }],
      { session }
    ).then(res => res[0]);

    if (brand) {
      newProduct.brand = brand;
      await newProduct.save({ session });
      
      // Add to brand products
      await BrandProducts.findByIdAndUpdate(brand, {
        $addToSet: { products: newProduct._id }
      }, { session, upsert: true });
    }

    // Add to category products
    if (categories && categories.length > 0) {
      for (const categoryId of categories) {
        await CategoryProducts.findByIdAndUpdate(categoryId, {
          $addToSet: { products: newProduct._id }
        }, { session, upsert: true });
      }
    }

    // Upload product images
    const productImageFiles = formData.getAll("images") as File[];
    console.log("[POST] productImageFiles:", productImageFiles);
    const uploadedProductImages: string[] = [];
    for (const file of productImageFiles) {
      if (file instanceof Blob) {

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (err) {
          console.log("Upload directory already exists or couldn't be created");
        }

        // Convert File to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate unique filename
        const originalFilename = (file as any).name || `file-${Date.now()}.jpg`;
        const fileExt = path.extname(originalFilename) || '.jpg';
        const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const tempFileName = `temp-${Date.now()}-${safeFilename}`;
        const tempFilePath = path.join(uploadDir, tempFileName);

        // Save buffer to disk (uses disk storage, not RAM)
        await writeFile(tempFilePath, buffer);
        console.log("File saved to disk:", tempFilePath);

        console.log("tempFilePath", tempFilePath)
        console.log("")


        const url = await uploadFileToS3(
          {

            filepath: tempFilePath,
            originalFilename: originalFilename,
            mimetype: (file as any).type || "application/octet-stream"

          },
          `products/${newProduct._id}`
        );
        console.log("[POST] uploadedProductImages:", uploadedProductImages);
        uploadedProductImages.push(url);
      }
    }
    if (uploadedProductImages.length > 0) {
      newProduct.images = uploadedProductImages;
      await newProduct.save({ session });
    }

    // Handle variants
    if (variants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const variantImageFiles = formData.getAll(`variantImages[${i}]`) as File[];
        const uploadedVariantImages: string[] = [];

        for (const file of variantImageFiles) {
          if (file instanceof Blob) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const url = await uploadFileToS3(
              {
                buffer,
                originalFilename: (file as any).name || `${Date.now()}.jpg`,
                mimetype: file.type,
              },
              `products/${newProduct._id}/variants/${v.sku || i}`
            );
            uploadedVariantImages.push(url);
          }
        }

        await Variant.create(
          [
            {
              product: newProduct._id,
              sku: v.sku,
              label: v.label,
              price: v.price,
              stock: v.stock,
              discount: v.discount || 0,
              images: uploadedVariantImages,
            },
          ],
          { session }
        );
      }
    }

    await session.commitTransaction();
    return NextResponse.json({ message: "Product created successfully", product: newProduct }, { status: 201 });
  } catch (err: any) {
    await session.abortTransaction();
    console.error("Error creating product:", err);
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  } finally {
    session.endSession();
  }
}

// ============================
//  GET ALL PRODUCTS
// ============================
export async function GET() {
  await dbConnect();
  try {
    const products = await Product.find().populate([
      {
        path: "brand",
        model: "Brand",
        // select: "name"
      },
      {
        path: "categories",
        model: "Category",
        // select: "name"
      },
      {
        path: "variants",
        model: "Variant",
        // select: "sku label price stock discount images"
      }
    ]).lean();
    return NextResponse.json({ products }, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch products" }, { status: 500 });
  }
}

// ============================
//  UPDATE PRODUCT
// ============================
export async function PUT(req: Request) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const formData = await req.formData();
    console.log("[PUT] formData:", formData);
    const productId = formData.get("id")?.toString();
    console.log("[PUT] productId:", productId);
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update fields
    if (formData.get("name")) product.name = formData.get("name")!.toString();
    if (formData.get("description")) product.description = formData.get("description")!.toString();
    if (formData.get("ingredients")) product.ingredients = formData.get("ingredients")!.toString();
    if (formData.get("price")) product.price = Number(formData.get("price"));
    if (formData.get("discount")) product.discount = Number(formData.get("discount"));
    if (formData.get("slug")) product.slug = formData.get("slug")!.toString();
    if (formData.get("isActive") !== null) product.isActive = formData.get("isActive")!.toString() === "true";
    if (formData.get("isOutOfStock") !== null) product.isOutOfStock = formData.get("isOutOfStock")!.toString() === "true";
    if (formData.get("isFeatured") !== null) product.isFeatured = formData.get("isFeatured")!.toString() === "true";
    if (formData.get("isTopSelling") !== null) product.isTopSelling = formData.get("isTopSelling")!.toString() === "true";
    if (formData.get("isNewArrival") !== null) product.isNewArrival = formData.get("isNewArrival")!.toString() === "true";
    if (formData.get("isBestSelling") !== null) product.isBestSelling = formData.get("isBestSelling")!.toString() === "true";
    
    // Handle brand changes
    const newBrand = formData.get("brand")?.toString();
    const oldBrand = product.brand?.toString();
    if (newBrand !== oldBrand) {
      // Remove from old brand products
      if (oldBrand) {
        await BrandProducts.findByIdAndUpdate(oldBrand, {
          $pull: { products: product._id }
        }, { session });
      }
      
      // Add to new brand products
      if (newBrand) {
        product.brand = newBrand;
        await BrandProducts.findByIdAndUpdate(newBrand, {
          $addToSet: { products: product._id }
        }, { session, upsert: true });
      } else {
        product.brand = undefined;
      }
    }
    
    // Handle category changes
    const newCategories = formData.getAll("categories").map((c: any) => c.toString());
    const oldCategories = product.categories.map((c: any) => c.toString());
    
    if (JSON.stringify(newCategories.sort()) !== JSON.stringify(oldCategories.sort())) {
      // Remove from old categories
      for (const oldCatId of oldCategories) {
        await CategoryProducts.findByIdAndUpdate(oldCatId, {
          $pull: { products: product._id }
        }, { session });
      }
      
      // Add to new categories
      for (const newCatId of newCategories) {
        await CategoryProducts.findByIdAndUpdate(newCatId, {
          $addToSet: { products: product._id }
        }, { session, upsert: true });
      }
      
      product.categories = newCategories;
    }

    // Handle product images - preserve existing ones and add new ones
    const existingImages = formData.getAll("existingImages") as string[];
    const newImageFiles = formData.getAll("images") as File[];
    
    // Start with existing images that weren't removed
    let finalImages = existingImages || [];
    
    // Add new uploaded images
    if (newImageFiles.length > 0) {
      const uploaded: string[] = [];
      
    for (const file of newImageFiles) {
      if (file instanceof Blob) {

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (err) {
          console.log("Upload directory already exists or couldn't be created");
        }

        // Convert File to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate unique filename
        const originalFilename = (file as any).name || `file-${Date.now()}.jpg`;
        const fileExt = path.extname(originalFilename) || '.jpg';
        const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const tempFileName = `temp-${Date.now()}-${safeFilename}`;
        const tempFilePath = path.join(uploadDir, tempFileName);

        // Save buffer to disk (uses disk storage, not RAM)
        await writeFile(tempFilePath, buffer);
        console.log("File saved to disk:", tempFilePath);

        console.log("tempFilePath", tempFilePath)
        console.log("")


          const url = await uploadFileToS3(
            {
              filepath: tempFilePath,
              originalFilename: originalFilename,
              mimetype: (file as any).type || "application/octet-stream"

            },
            `products/${product._id}`
          );
          finalImages.push(url);
        }
      }
    }
    
    // Update product images
    product.images = finalImages;

    await product.save({ session });
    await session.commitTransaction();

    return NextResponse.json({ message: "Product updated successfully", product }, { status: 200 });
  } catch (err: any) {
    await session.abortTransaction();
    console.error("Error updating product:", err);
    return NextResponse.json({ error: err.message || "Failed to update product" }, { status: 500 });
  } finally {
    session.endSession();
  }
}

// ============================
//  DELETE PRODUCT
// ============================
export async function DELETE(req: Request) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // @ts-ignore
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id).session(session);
    await Variant.deleteMany({ product: id }).session(session);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Remove from brand products
    if (deletedProduct.brand) {
      await BrandProducts.findByIdAndUpdate(deletedProduct.brand, {
        $pull: { products: id }
      }, { session });
    }

    // Remove from category products
    if (deletedProduct.categories && deletedProduct.categories.length > 0) {
      for (const categoryId of deletedProduct.categories) {
        await CategoryProducts.findByIdAndUpdate(categoryId, {
          $pull: { products: id }
        }, { session });
      }
    }

    await session.commitTransaction();
    return NextResponse.json({ message: "Product deleted successfully", product: deletedProduct }, { status: 200 });
  } catch (err: any) {
    await session.abortTransaction();
    console.error("Error deleting product:", err);
    return NextResponse.json({ error: err.message || "Failed to delete product" }, { status: 500 });
  } finally {
    session.endSession();
  }
}

// import { uploadFileToS3 } from "@/lib/api/aws/aws";
// import dbConnect from "@/lib/mongodb";
// import Product, { productZodSchema } from "@/models/Product";
// import Variant from "@/models/Variant";
// import mongoose from "mongoose";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   await dbConnect();
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const formData = await req.formData();

//     // Base product fields
//     const raw = {
//       name: formData.get("name")?.toString(),
//       description: formData.get("description")?.toString() ?? "",
//       price: Number(formData.get("price")),
//       categories: formData.getAll("categories").map(c => c.toString()),
//       brand: formData.get("brand")?.toString(),
//       slug: formData.get("slug")?.toString(),
//       variants: JSON.parse(formData.get("variants")?.toString() || "[]"), // metadata only (sku, label, etc.)
//     };

//     const parsed = productZodSchema.safeParse(raw);
//     if (!parsed.success) {
//       return NextResponse.json({ error: parsed.error.message }, { status: 400 });
//     }

//     let { name, description, price, categories, brand, slug, variants } = parsed.data;

//     if (!slug) {
//       slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
//     }

//     //  Create product
//     const newProduct = await Product.create(
//       [{ name, description, price, slug, categories }],
//       { session }
//     ).then(res => res[0]);

//     if (brand) {
//       newProduct.brand = brand;
//       await newProduct.save({ session });
//     }

//     //  Upload product-level images
//     const productImageFiles = formData.getAll("images") as File[];
//     const uploadedProductImages: string[] = [];

//     for (const file of productImageFiles) {
//       if (file instanceof Blob) {
//         const arrayBuffer = await file.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const url = await uploadFileToS3(
//           {
//             buffer,
//             originalFilename: (file as any).name || `${Date.now()}.jpg`,
//             mimetype: file.type,
//           },
//           `products/${newProduct._id}`
//         );
//         uploadedProductImages.push(url);
//       }
//     }

//     if (uploadedProductImages.length > 0) {
//       newProduct.images = uploadedProductImages;
//       await newProduct.save({ session });
//     }

//     //  Handle variants with image uploads
//     if (variants && variants.length > 0) {
//       for (let i = 0; i < variants.length; i++) {
//         const v = variants[i];

//         // Expecting frontend to send variant image files with a key like: "variantImages[0]", "variantImages[1]", etc.
//         const variantImageFiles = formData.getAll(`variantImages[${i}]`) as File[];
//         const uploadedVariantImages: string[] = [];

//         for (const file of variantImageFiles) {
//           if (file instanceof Blob) {
//             const arrayBuffer = await file.arrayBuffer();
//             const buffer = Buffer.from(arrayBuffer);
//             const url = await uploadFileToS3(
//               {
//                 buffer,
//                 originalFilename: (file as any).name || `${Date.now()}.jpg`,
//                 mimetype: file.type,
//               },
//               `products/${newProduct._id}/variants/${v.sku || i}`
//             );
//             uploadedVariantImages.push(url);
//           }
//         }

//         await Variant.create(
//           [
//             {
//               product: newProduct._id,
//               sku: v.sku,
//               label: v.label,
//               price: v.price,
//               stock: v.stock,
//               images: uploadedVariantImages, // now stores uploaded S3 URLs
//             },
//           ],
//           { session }
//         );
//       }
//     }

//     await session.commitTransaction();

//     return NextResponse.json(
//       { message: "Product created successfully", product: newProduct },
//       { status: 201 }
//     );
//   } catch (err: any) {
//     await session.abortTransaction();
//     console.error("Error creating product:", err);
//     return NextResponse.json(
//       { error: err.message || "Failed to create product" },
//       { status: 500 }
//     );
//   } finally {
//     session.endSession();
//   }
// }
