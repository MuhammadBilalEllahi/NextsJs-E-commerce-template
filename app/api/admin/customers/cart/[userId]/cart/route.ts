import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import Cart from "@/models/Cart";
import { CURRENCY } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { userId } = await params;

    const cart = (await Cart.findOne({ user: userId }).lean()) as {
      items?: any[];
      currency?: string;
      updatedAt?: Date;
    } | null;
    if (!cart) {
      return NextResponse.json({
        items: [],
        currency: CURRENCY.SYMBOL,
        updatedAt: null,
      });
    }

    return NextResponse.json({
      items: cart.items || [],
      currency: cart.currency || CURRENCY.SYMBOL,
      updatedAt: cart.updatedAt || null,
    });
  } catch (error: any) {
    console.error("Failed to fetch customer cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer cart", details: error.message },
      { status: 500 }
    );
  }
}
