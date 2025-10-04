import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import JobApplication from "@/models/JobApplication";
import Career from "@/models/Career";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploaderFiles } from "@/lib/utils/imageUploader/awsImageUploader";

// GET - Fetch all job applications (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const applications = await JobApplication.find({})
      .populate("job", "title location type")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error("Error fetching job applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch job applications", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new job application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const job = formData.get("job") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const resumeFile = formData.get("resume") as File;

    await dbConnect();

    // Verify job exists
    const career = await Career.findById(job);
    if (!career) {
      return NextResponse.json(
        { error: "Job position not found" },
        { status: 404 }
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
          { error: "Failed to upload resume" },
          { status: 500 }
        );
      }
    }

    const application = await JobApplication.create({
      job,
      name,
      email,
      phone: phone || undefined,
      resumeUrl: resumeUrl || undefined,
      coverLetter: coverLetter || undefined,
    });

    // Populate the job field for response
    await application.populate("job", "title location type");

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job application:", error);
    return NextResponse.json(
      { error: "Failed to create job application", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update job application
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      // Handle status updates
      const body = await request.json();
      const { id, status, notes } = body;

      await dbConnect();

      const application = await JobApplication.findById(id);
      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      if (status) {
        application.status = status;
      }
      if (notes !== undefined) {
        application.notes = notes;
      }

      await application.save();

      // Populate the job field for response
      await application.populate("job", "title location type");

      return NextResponse.json({ success: true, application });
    } else {
      // Handle form data updates (legacy)
      const formData = await request.formData();
      const id = formData.get("id") as string;
      const job = formData.get("job") as string;
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const coverLetter = formData.get("coverLetter") as string;
      const resumeFile = formData.get("resume") as File;

      await dbConnect();

      const application = await JobApplication.findById(id);
      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      // Verify job exists
      const career = await Career.findById(job);
      if (!career) {
        return NextResponse.json(
          { error: "Job position not found" },
          { status: 404 }
        );
      }

      // Handle resume upload if new resume provided
      if (resumeFile && resumeFile.size > 0) {
        try {
          const uploadResults = await uploaderFiles(
            "job-applications",
            resumeFile,
            `${name.replace(/\s+/g, "-")}-${Date.now()}`
          );
          if (uploadResults.length > 0) {
            application.resumeUrl = uploadResults[0].url;
          }
        } catch (uploadError) {
          console.error("Resume upload failed:", uploadError);
          return NextResponse.json(
            { error: "Failed to upload resume" },
            { status: 500 }
          );
        }
      }

      application.job = job as any;
      application.name = name;
      application.email = email;
      application.phone = phone || undefined;
      application.coverLetter = coverLetter || undefined;

      await application.save();

      // Populate the job field for response
      await application.populate("job", "title location type");

      return NextResponse.json({ success: true, application });
    }
  } catch (error: any) {
    console.error("Error updating job application:", error);
    return NextResponse.json(
      { error: "Failed to update job application", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete job application
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    await dbConnect();

    const application = await JobApplication.findByIdAndDelete(id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting job application:", error);
    return NextResponse.json(
      { error: "Failed to delete job application", details: error.message },
      { status: 500 }
    );
  }
}
