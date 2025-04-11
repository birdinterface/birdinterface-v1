import type { NextAuthConfig } from "next-auth";

export const authConfig = {
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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);
      // Define protected routes based on your matcher in middleware.ts
      const protectedRoutes = ["/", "/:id"];
      const isProtectedRoute = protectedRoutes.some(route => {
        if (route.endsWith('/:id')) {
          // Match dynamic routes like /task/123
          const baseRoute = route.substring(0, route.lastIndexOf('/'));
          return nextUrl.pathname.startsWith(baseRoute + '/');
        } 
        return nextUrl.pathname === route;
      });

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl)); // Redirect logged-in users from auth pages
        }
        return true; // Allow access to auth pages if not logged in
      }

      if (isProtectedRoute) {
        if (!isLoggedIn) {
          // Returning false triggers redirect to the signIn page defined above
          return false;
        }
      }

      // Allow access to all other routes by default
      return true;
    },
  },
} satisfies NextAuthConfig; 