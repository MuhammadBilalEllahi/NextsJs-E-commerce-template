import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import ContentPage from "@/models/ContentPage";
import { contentPagesSeedData } from "@/lib/seed-data/content-pages";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const pageData of contentPagesSeedData) {
      try {
        const existingPage = await ContentPage.findOne({ slug: pageData.slug });

        if (existingPage) {
          // Update existing page
          await ContentPage.findOneAndUpdate(
            { slug: pageData.slug },
            {
              title: pageData.title,
              content: pageData.content,
              metaDescription: pageData.metaDescription,
              isActive: pageData.isActive,
              updatedAt: new Date(),
            }
          );
          results.updated++;
        } else {
          // Create new page
          await ContentPage.create({
            title: pageData.title,
            slug: pageData.slug,
            content: pageData.content,
            metaDescription: pageData.metaDescription,
            isActive: pageData.isActive,
          });
          results.created++;
        }
      } catch (error: any) {
        results.errors.push(
          `Failed to process ${pageData.slug}: ${error.message}`
        );
      }
    }

    return NextResponse.json({
      message: "Seed data applied successfully",
      results,
    });
  } catch (error: any) {
    console.error("Error applying seed data:", error);
    return NextResponse.json(
      { error: "Failed to apply seed data", details: error.message },
      { status: 500 }
    );
  }
}
