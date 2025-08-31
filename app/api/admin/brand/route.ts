import { uploadFileToS3 } from "@/lib/utils/aws/aws";
import dbConnect from "@/database/mongodb";
import Brand from "@/models/Brand";
import { brandZodSchema } from "@/models/Brand";
import { mkdir, writeFile } from "fs/promises";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import path from "path";

// ✅ CREATE brand
export async function POST(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const formData = await req.formData();

        // console.log("FORMDATA", formData)

        const raw = {
            name: formData.get("name")?.toString(),
            description: formData.get("description")?.toString() ?? "",
        };

        // console.log("RAW DATA", raw); // Add this to debug

        const parsed = brandZodSchema.safeParse(raw);
        if (!parsed.success) {
            // console.log("ZOD VALIDATION ERRORS:", parsed.error.message); // Add this to debug
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.message },
                { status: 400 }
            );
        }

        // ✅ create base brand (without logo)
        const newBrand = await Brand.create(
            [{ name: raw.name, description: raw.description }],
            { session }
        ).then(res => res[0]);


        const logoFile = formData.get("logo") as File | null;

        // Upload image if present
        let imageUrl: string | undefined;
        // const file = imageFile as formidable.File | formidable.File[] | undefined;
        if (logoFile && logoFile instanceof Blob) {

            // Create uploads directory if it doesn't exist
            const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (err) {
                // console.log("Upload directory already exists or couldn't be created");
            }

            // Convert File to buffer
            const arrayBuffer = await logoFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Generate unique filename
            const originalFilename = (logoFile as any).name || `file-${Date.now()}.jpg`;
            const fileExt = path.extname(originalFilename) || '.jpg';
            const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
            const tempFileName = `temp-${Date.now()}-${safeFilename}`;
            const tempFilePath = path.join(uploadDir, tempFileName);

            // Save buffer to disk (uses disk storage, not RAM)
            await writeFile(tempFilePath, buffer);
            // console.log("File saved to disk:", tempFilePath);

            // console.log("tempFilePath", tempFilePath)
            // console.log("")

            imageUrl = await uploadFileToS3({
                filepath: tempFilePath,
                originalFilename: originalFilename,
                mimetype: (logoFile as any).type || "application/octet-stream"
            }, `brand/${newBrand}/logo`);

            // imageUrl = await uploadFileToS3({ buffer, originalFilename: originalFilename, mimetype: imageData.type }, "categories");
        }




        // ✅ handle logo upload
        // const logoFile = formData.get("logo") as File | null;
        // if (logoFile && logoFile instanceof Blob) {
        //   const arrayBuffer = await logoFile.arrayBuffer();
        //   const buffer = Buffer.from(arrayBuffer);

        //   const imageUrl = await uploadFileToS3(
        //     {
        //       buffer,
        //       originalFilename: (logoFile as any).name || `${Date.now()}.jpg`,
        //       mimetype: logoFile.type,
        //     },
        //     `brands/${newBrand._id}/logo`
        //   );

        //   newBrand.logo = imageUrl;
        //   await newBrand.save({ session });
        // }

        await session.commitTransaction();

        return NextResponse.json(
            { message: "Brand created successfully", brand: newBrand },
            { status: 201 }
        );
    } catch (err: any) {
        await session.abortTransaction();
        console.error("Error creating brand:", err);
        return NextResponse.json(
            { error: err.message || "Failed to create brand" },
            { status: 500 }
        );
    } finally {
        session.endSession();
    }
}

// ✅ READ all brands
export async function GET() {
    await dbConnect();
    try {
        const brands = await Brand.find({});
        return NextResponse.json({ brands }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to fetch brands" },
            { status: 500 }
        );
    }
}

// ✅ UPDATE brand
export async function PUT(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const formData = await req.formData();
        const brandId = formData.get("id")?.toString();
        if (!brandId) {
            return NextResponse.json(
                { error: "Brand ID is required" },
                { status: 400 }
            );
        }

        const brand = await Brand.findById(brandId).session(session);
        if (!brand) {
            return NextResponse.json({ error: "Brand not found" }, { status: 404 });
        }

        if (formData.get("name")) brand.name = formData.get("name")!.toString();
        if (formData.get("description"))
            brand.description = formData.get("description")!.toString();

        // ✅ update logo if provided
        const logoFile = formData.get("logo") as File | null;
        if (logoFile && logoFile instanceof Blob) {
            const arrayBuffer = await logoFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const imageUrl = await uploadFileToS3(
                {
                    buffer,
                    originalFilename: (logoFile as any).name || `${Date.now()}.jpg`,
                    mimetype: logoFile.type,
                },
                `brands/${brand._id}/logo`
            );

            brand.logo = imageUrl;
        }

        await brand.save({ session });
        await session.commitTransaction();

        return NextResponse.json(
            { message: "Brand updated successfully", brand },
            { status: 200 }
        );
    } catch (err: any) {
        await session.abortTransaction();
        console.error("Error updating brand:", err);
        return NextResponse.json(
            { error: err.message || "Failed to update brand" },
            { status: 500 }
        );
    } finally {
        session.endSession();
    }
}

// ✅ DELETE brand
export async function DELETE(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: "Brand ID is required" },
                { status: 400 }
            );
        }

        const deleted = await Brand.findByIdAndDelete(id).session(session);
        if (!deleted) {
            return NextResponse.json({ error: "Brand not found" }, { status: 404 });
        }

        await session.commitTransaction();
        return NextResponse.json(
            { message: "Brand deleted successfully", brand: deleted },
            { status: 200 }
        );
    } catch (err: any) {
        await session.abortTransaction();
        console.error("Error deleting brand:", err);
        return NextResponse.json(
            { error: err.message || "Failed to delete brand" },
            { status: 500 }
        );
    } finally {
        session.endSession();
    }
}
