import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateWhatsAppConfig } from "@/lib/utils/whatsappConfig";

// GET - Check WhatsApp configuration status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = validateWhatsAppConfig();

    return NextResponse.json({
      isConfigured: validation.isValid,
      errors: validation.errors,
    });
  } catch (error: any) {
    console.error("Error checking WhatsApp configuration:", error);
    return NextResponse.json(
      { error: "Failed to check configuration", details: error.message },
      { status: 500 }
    );
  }
}

