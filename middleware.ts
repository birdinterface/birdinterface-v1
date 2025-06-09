// Remove unused imports if any

// Import the consolidated auth object
// import { auth } from "@/app/(auth)/auth";
import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config" // Import the Edge-safe config

// Initialize NextAuth with only the Edge-safe config for the middleware
const auth = NextAuth(authConfig).auth

export default auth((req) => {
  // Don't redirect if already on /welcome
  if (req.nextUrl.pathname === "/welcome") {
    return NextResponse.next()
  }

  // Don't redirect API routes
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Don't redirect _next internal routes
  if (req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next()
  }

  // Don't redirect static files and images
  if (
    req.nextUrl.pathname.startsWith("/images") ||
    req.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated (including demo user)
  if (req.auth?.user) {
    // User is authenticated, allow access
    return NextResponse.next()
  }

  // Redirect unauthenticated users to /welcome
  return NextResponse.redirect(new URL("/welcome", req.url))
})

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images/).*)",
  ],
}
