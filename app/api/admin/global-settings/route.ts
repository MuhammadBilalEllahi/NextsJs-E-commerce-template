import { NextResponse } from "next/server";
import GlobalSettings, { zodGlobalSettingsSchema } from "@/models/GlobalSettings";
import dbConnect from "@/database/mongodb";
import RedisClient from "@/database/redisClient";
import { CACHE_BANNER_KEY, CACHE_GLOBAL_SETTINGS_KEY } from "@/lib/cacheConstants";
import { CACHE_EXPIRE_TIME } from "@/lib/cacheConstants";

export async function GET() {
    try {
        await dbConnect();
            const cachedSettings = await RedisClient.get(CACHE_GLOBAL_SETTINGS_KEY);
        if(cachedSettings){
            return NextResponse.json({ settings: JSON.parse(cachedSettings) });
        }
        
        // Get or create default global settings
        let settings = await GlobalSettings.findOne().lean();
        
        if (!settings) {
            // Create default settings if none exist
            settings = await GlobalSettings.create({
                bannerScrollTime: 5000
            });
        }
        
        await RedisClient.set(CACHE_GLOBAL_SETTINGS_KEY, JSON.stringify(settings), CACHE_EXPIRE_TIME);
        
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
        await RedisClient.del(CACHE_BANNER_KEY);
        await RedisClient.set(CACHE_GLOBAL_SETTINGS_KEY, JSON.stringify(settings), CACHE_EXPIRE_TIME);
        await RedisClient.del(CACHE_GLOBAL_SETTINGS_KEY);
        
        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Error updating global settings:", error);
        return NextResponse.json({ error: "Failed to update global settings" }, { status: 500 });
    }
}
