import { NextResponse } from "next/server";
import GlobalSettings, { zodGlobalSettingsSchema } from "@/models/GlobalSettings";
import dbConnect from "@/database/mongodb";
import RedisClient from "@/database/redisClient";

export async function GET() {
    try {
        await dbConnect();
        
        // Get or create default global settings
        let settings = await GlobalSettings.findOne().lean();
        
        if (!settings) {
            // Create default settings if none exist
            settings = await GlobalSettings.create({
                bannerScrollTime: 5000
            });
        }
        
        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Error fetching global settings:", error);
        return NextResponse.json({ error: "Failed to fetch global settings" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        
        const body = await req.json();
        const { bannerScrollTime } = body;
        
        const parsed = zodGlobalSettingsSchema.safeParse({ bannerScrollTime });
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.message }, { status: 400 });
        }
        
        // Update or create global settings
        const settings = await GlobalSettings.findOneAndUpdate(
            {},
            { bannerScrollTime: parsed.data.bannerScrollTime },
            { upsert: true, new: true }
        );
        
        // Invalidate Redis cache for banners since scroll time affects them
        await RedisClient.del("banners");
        
        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Error updating global settings:", error);
        return NextResponse.json({ error: "Failed to update global settings" }, { status: 500 });
    }
}
