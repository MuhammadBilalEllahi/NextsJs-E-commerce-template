import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Career from "@/models/Career";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const careers = await Career.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, careers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const created = await Career.create(body);
    return NextResponse.json({ success: true, career: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { id, ...update } = body;
    const updated = await Career.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();
    return NextResponse.json({ success: true, career: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { success: false, error: "id required" },
        { status: 400 }
      );
    await Career.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 400 }
    );
  }
}
