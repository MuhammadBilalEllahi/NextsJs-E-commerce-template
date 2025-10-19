import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { useAuth } from "@/lib/providers/authProvider";
import { useCart } from "@/lib/providers/cartContext";

// Utility function to merge guest cart with user cart
export async function mergeGuestCartWithUser(
  userId: string,
  sessionId: string
) {
  try {
    const response = await fetch("/api/cart", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, sessionId }),
    });

    if (response.ok) {
      // Clear guest ID from localStorage after successful merge
      if (typeof window !== "undefined") {
        localStorage.removeItem("dm-guest-cart-id");
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to merge guest cart:", error);
    return false;
  }
}

// Function to handle cart merging when user authenticates
export async function handleCartMergeOnAuth(userId: string) {
  if (typeof window === "undefined") return;

  const guestId = localStorage.getItem("dm-guest-cart-id");
  if (guestId) {
    const { user } = useAuth();
    const { syncAll } = useCart();
    syncAll().then(async () => {
      await mergeGuestCartWithUser(userId, guestId);
    });
  }
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is an admin route
  if (pathname.startsWith("/admin")) {
    try {
      // Get the NextAuth token from cookies
      const token = await getToken({
        req: request,
        secret: process.env.JWT_SECRET || "fallback-secret",
      });

      if (!token) {
        // Redirect to login with redirect parameter
        const loginUrl = new URL("/account/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user has admin role
      if (token.role !== "admin") {
        // Redirect to home page with access denied message
        const homeUrl = new URL("/", request.url);
        homeUrl.searchParams.set(
          "error",
          "Access-denied. Admin privileges required."
        );
        return NextResponse.redirect(homeUrl);
      }

      // User is authenticated and has admin role, allow access
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For non-admin routes, just continue
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
