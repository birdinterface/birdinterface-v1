import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

export const authConfig: NextAuthConfig = {
  // Explicitly trust the host in the Edge environment
  trustHost: true,
  // Providers can be defined here if they are Edge-compatible
  // (e.g., Google might be, depending on usage, but Credentials using DB is not)
  // For simplicity, we'll keep providers in the main auth.ts for now.
  providers: [],
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  callbacks: {
    authorized(params) {
      const { auth, request } = params
      const isLoggedIn = !!auth?.user
      const isAuthRoute = ["/login", "/register"].includes(
        request.nextUrl.pathname
      )

      if (isAuthRoute) {
        if (isLoggedIn) {
          // Redirect logged-in users trying to access login/register
          return NextResponse.redirect(new URL("/", request.nextUrl))
        }
        // Allow unauthenticated users to access login/register
        return true
      } else {
        // For any other route covered by the matcher ("/", "/:id")
        // Allow access if logged in
        return isLoggedIn
      }
    },
  },
}
