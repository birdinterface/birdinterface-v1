import { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

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
      let isLoggedIn = !!auth?.user
      let isOnChat = nextUrl.pathname.startsWith("/")
      let isOnRegister = nextUrl.pathname.startsWith("/register")
      let isOnLogin = nextUrl.pathname.startsWith("/login")

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL("/", nextUrl))
      }

      if (isOnRegister || isOnLogin) {
        return true
      }

      if (isOnChat) {
        if (isLoggedIn) return true
        return false
      }

      if (isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl))
      }

      return true
    },
  },
} satisfies NextAuthConfig
