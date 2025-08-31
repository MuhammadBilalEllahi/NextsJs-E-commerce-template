import { NextResponse } from "next/server";
import Banner, { zodBannerSchema } from "@/models/Banner";
import { uploaderFiles } from "@/lib/utils/imageUploader/awsImageUploader";
import dbConnect from "@/database/mongodb";
import mongoose from "mongoose";
import RedisClient from "@/database/redisClient";
import { CACHE_BANNER_KEY, CACHE_GLOBAL_SETTINGS_KEY } from "@/lib/cacheConstants";
import { CACHE_EXPIRE_TIME } from "@/lib/cacheConstants";
interface Banner {
    _id: string,
    title: string
    description: string
    image: string
    link: string
    isActive: boolean
    expiresAt: Date
    showTitle: boolean
    showLink: boolean
    showDescription: boolean
    mimeType: string
}

export async function POST(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const formData = await req.formData();

        // console.log(formData);
        const raw = {
            title: formData.get("title"),
            description: formData.get("description"),
            // image: formData.get("image"),
            link: formData.get("link"),
            isActive: formData.get("isActive") === 'true' ? true : false,
            showTitle: formData.get('showTitle') === 'true' ? true : false,
            showLink: formData.get('showLink') === 'true' ?true: false,
            showDescription: formData.get('showDescription') ==='true' ?true: false,
            timeout: formData.get("timeout") ? Number(formData.get("timeout")) : null
        }
        // console.log(formData.get("expiresAt"), formData.get("expiresAt") !== "" && formData.get("expiresAt") !== null);
        if(formData.get("expiresAt") && formData.get("expiresAt") !== "" && formData.get("expiresAt") !== null && formData.get("expiresAt") !== undefined){
            raw.expiresAt = new Date(formData.get("expiresAt") as string);
        }
        const parsed = zodBannerSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.message }, { status: 400 });
        }

        let { title, description, link, isActive, expiresAt, showDescription, showTitle, showLink, timeout } = parsed.data;

        zodBannerSchema.parse(raw);
        const banner = await Banner.create(
            [{ title, description, link, isActive, expiresAt, showDescription, showTitle, showLink, timeout }],
            { session }).then(res => res[0]);

        const image = formData.get("image") as File;
        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        const uploadedImages = await uploaderFiles('banners', image, banner._id);

        const uploadImageToBanner = await Banner.findByIdAndUpdate(banner._id, {
            image: uploadedImages[0].url,
            mimeType: uploadedImages[0].mimetype
        }, { session, upsert: true, new: true });

        await session.commitTransaction();

        if(await RedisClient.get(CACHE_BANNER_KEY) !== null){
            await RedisClient.del(CACHE_BANNER_KEY);
        }

        return NextResponse.json(banner);

    } catch (err: any) {
        await session.abortTransaction();
        console.error("Error creating banner:", err);
        return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
    } finally {
        const value = await RedisClient.get(CACHE_BANNER_KEY);

        if (value) {
            await RedisClient.del(CACHE_BANNER_KEY)
        }
        session.endSession();
    }
}


export async function GET() {
    
    try {
        await dbConnect();
        const value = await RedisClient.get(CACHE_BANNER_KEY);

        if (value) {
            const banners = JSON.parse(value)
            return NextResponse.json({ banners })
        }

        const banners = await Banner.find().lean();
        if (!banners) {
            return NextResponse.json({ banners: [] })
        }

        await RedisClient.set(CACHE_BANNER_KEY, JSON.stringify(banners), CACHE_EXPIRE_TIME);

        return NextResponse.json({ banners })

    } catch (error) {
        console.error("Error fetching banners:", error);
        return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }
}

// Redis purge endpoint
export async function PATCH(req: Request) {
    try {
        const { action } = await req.json();
        
        if (action === 'purge') {
            await RedisClient.del(CACHE_BANNER_KEY);
            return NextResponse.json({ message: "Redis cache purged successfully" });
        }
        
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error purging Redis:", error);
        return NextResponse.json({ error: "Failed to purge Redis cache" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const formData = await req.formData();

        const _id = formData.get("_id")?.toString();
        if (!_id) return NextResponse.json({ error: "Missing banner ID" }, { status: 400 });

        const raw = {
            title: formData.get("title"),
            description: formData.get("description"),
            link: formData.get("link"),
            isActive: formData.get("isActive") === "true",
            expiresAt: new Date(formData.get("expiresAt") as string),
            showTitle: formData.get("showTitle") === "true",
            showLink: formData.get("showLink") === "true",
            showDescription: formData.get("showDescription") === "true",
            timeout: formData.get("timeout") ? Number(formData.get("timeout")) : null
        };

        const parsed = zodBannerSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.message }, { status: 400 });
        }

        const image = formData.get("image") as File | null;

        let updateData = { ...parsed.data };

        // Optional: update image if provided
        if (image && image.size > 0) {
            const uploadedImages = await uploaderFiles("banners", image, _id);
            updateData = {
                ...updateData,
                image: uploadedImages[0].url,
                mimeType: uploadedImages[0].mimetype
            };
        }

        const updatedBanner = await Banner.findByIdAndUpdate(_id, updateData, {
            new: true,
            session
        });

        if (!updatedBanner) {
            throw new Error("Banner not found or update failed");
        }

        await session.commitTransaction();

        // Invalidate Redis cache
        await RedisClient.del(CACHE_BANNER_KEY);

        return NextResponse.json(updatedBanner);
    } catch (err: any) {
        await session.abortTransaction();
        console.error("Error updating banner:", err);
        return NextResponse.json({ error: err.message || "Failed to update banner" }, { status: 500 });
    } finally {
        session.endSession();
    }
}

export async function DELETE(req: Request) {
    await dbConnect();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { _id } = await req.json();

        if (!_id) {
            return NextResponse.json({ error: "Missing banner ID" }, { status: 400 });
        }

        const deletedBanner = await Banner.findByIdAndDelete(_id, { session });

        if (!deletedBanner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }

        await session.commitTransaction();

        // Invalidate Redis cache
            await RedisClient.del(CACHE_BANNER_KEY);

        return NextResponse.json({ message: "Banner deleted", banner: deletedBanner });
    } catch (err: any) {
        await session.abortTransaction();
        console.error("Error deleting banner:", err);
        return NextResponse.json({ error: err.message || "Failed to delete banner" }, { status: 500 });
    } finally {
        session.endSession();
    }
}
