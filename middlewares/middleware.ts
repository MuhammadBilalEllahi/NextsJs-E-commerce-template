import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the route is an admin route
  if (pathname.startsWith('/admin')) {
    // Get the session token from cookies
    const sessionToken = request.cookies.get('session-token')?.value
    
    // For now, we'll use a simple check - in production, you'd validate the token
    // against your authentication service (e.g., JWT, session store, etc.)
    if (!sessionToken) {
      // Redirect to login page if no session token
      const loginUrl = new URL('/account/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // You could also check user role here if needed
    // const userRole = getUserRoleFromToken(sessionToken)
    // if (userRole !== 'admin') {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url))
    // }
  }
  
  return NextResponse.next()
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
