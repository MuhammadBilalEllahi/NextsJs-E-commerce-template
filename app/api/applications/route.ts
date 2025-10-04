import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import JobApplication from "@/models/JobApplication";
import { uploaderFiles } from "@/lib/utils/imageUploader/awsImageUploader";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const job = formData.get("job") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const resumeFile = formData.get("resume") as File;

    if (!job || !name || !email || !resumeFile) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    let resumeUrl = "";

    // Handle resume upload
    if (resumeFile && resumeFile.size > 0) {
      try {
        const uploadResults = await uploaderFiles(
          "job-applications",
          resumeFile,
          `${name.replace(/\s+/g, "-")}-${Date.now()}`
        );
        if (uploadResults.length > 0) {
          resumeUrl = uploadResults[0].url;
        }
      } catch (uploadError) {
        console.error("Resume upload failed:", uploadError);
        return NextResponse.json(
          { success: false, error: "Failed to upload resume" },
          { status: 500 }
        );
      }
    }

    const applicationData = {
      job,
      name,
      email,
      phone: phone || undefined,
      resumeUrl,
      coverLetter: coverLetter || undefined,
    };

    const created = await JobApplication.create(applicationData);
    return NextResponse.json({ success: true, application: created });
  } catch (error: any) {
    console.error("Error creating job application:", error);
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 400 }
    );
  }
}
