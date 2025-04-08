import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith("/");
      const isOnRegister = nextUrl.pathname.startsWith("/register");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      // Allow access to register and login pages when not logged in
      if (!isLoggedIn && (isOnRegister || isOnLogin)) {
        return true;
      }

      // Redirect to home if trying to access auth pages while logged in
      if (isLoggedIn && (isOnRegister || isOnLogin)) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // Protect chat routes
      if (isOnChat) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig; 