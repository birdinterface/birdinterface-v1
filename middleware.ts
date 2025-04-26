
// Remove unused imports if any

// Import the consolidated auth object
// import { auth } from "@/app/(auth)/auth";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // Import the Edge-safe config
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Initialize NextAuth with only the Edge-safe config for the middleware
const auth = NextAuth(authConfig).auth;

export async function middleware(request: NextRequest) {
  // Don't redirect if already on /welcome
  if (request.nextUrl.pathname === '/welcome') {
    return NextResponse.next()
  }

  // Don't redirect API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Don't redirect _next internal routes
  if (request.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Don't redirect static files and images
  if (
    request.nextUrl.pathname.startsWith('/images') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Redirect everything else to /welcome
  return NextResponse.redirect(new URL('/welcome', request.url))
}

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
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
}