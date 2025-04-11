import type { NextAuthConfig, Session } from "next-auth";
import type { NextRequest } from 'next/server';

export const authConfig = {
  // Explicitly trust the host in the Edge environment
  trustHost: true,
  // Providers can be defined here if they are Edge-compatible
  // (e.g., Google might be, depending on usage, but Credentials using DB is not)
  // For simplicity, we'll keep providers in the main auth.ts for now.
  providers: [/* Keep empty or add only Edge-safe providers */],
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  callbacks: {
    // The authorized callback runs in middleware, so it must be Edge-compatible.
    // Ensure no database calls or Node.js APIs are used here.
    authorized({ auth, request }: { auth: Session | null; request: NextRequest }) {
      const nextUrl = request.nextUrl; // Extract nextUrl from the typed request
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

      if (isAuthRoute) {
        if (isLoggedIn) {
          // Redirect logged-in users trying to access login/register
          return Response.redirect(new URL("/", nextUrl));
        }
        // Allow unauthenticated users to access login/register
        return true;
      } else {
        // For any other route covered by the matcher ("/", "/:id")
        // Allow access if logged in
        if (isLoggedIn) {
          return true;
        }
        // Deny access if not logged in, triggering redirect to signIn page
        return false;
      }
    },
  },
} satisfies NextAuthConfig; 