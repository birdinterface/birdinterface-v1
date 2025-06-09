import { compare } from "bcrypt-ts";
import NextAuth, { DefaultSession, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { authConfig } from "@/auth.config";
import { getUser, createUser } from "@/lib/queries";
import { User as DbUser } from "@/lib/supabase";

declare module "next-auth" {
  interface User {
    id?: string;
    membership?: string;
    stripecustomerid?: string;
    stripesubscriptionid?: string;
    usage?: string;
  }

  interface Session {
    user: {
      id?: string;
      membership?: string;
      stripecustomerid?: string;
      stripesubscriptionid?: string;
      usage?: string;
    } & DefaultSession["user"]
  }
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {},
      async authorize({ email, password, demoCode }: any) {
        // Handle demo user authentication
        if (demoCode === '2222') {
          return {
            id: '3aad0575-0bb7-4bd4-bbae-1d83be0b71f3',
            email: 'demo@birdinterface.com',
            name: 'Demo User',
            membership: 'free',
          };
        }
        
        let users = await getUser(email);
        if (users.length === 0) return null;
        
        const user = users[0];
        
        if (!user.password) {
          console.log("This is a Google account, please sign in with Google");
          return null;
        }
        
        let passwordsMatch = await compare(password, user.password);
        if (passwordsMatch) {
          return {
            id: user.id,
            email: user.email,
            membership: user.membership,
            name: user.name || "",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const dbUser = await getUser(user.email!);
          if (dbUser.length === 0) {
            await createUser(
              user.email!,
              null,
              user.name || ''
            );
            const [newUser] = await getUser(user.email!);
            user.id = newUser.id;
            user.membership = newUser.membership;
            user.stripecustomerid = newUser.stripecustomerid || undefined;
            user.stripesubscriptionid = newUser.stripesubscriptionid || undefined;
            user.usage = newUser.usage;
          } else {
            const existingUser = dbUser[0];
            user.id = existingUser.id;
            user.membership = existingUser.membership;
            user.stripecustomerid = existingUser.stripecustomerid || undefined;
            user.stripesubscriptionid = existingUser.stripesubscriptionid || undefined;
            user.usage = existingUser.usage;
          }
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.membership = user.membership;
        token.name = user.name || "";
        token.picture = user.image;
        token.stripecustomerid = user.stripecustomerid || undefined;
        token.stripesubscriptionid = user.stripesubscriptionid || undefined;
        token.usage = user.usage;
      }
      if (trigger === "update" && session?.user) {
        token.membership = session.user.membership;
        token.stripecustomerid = session.user.stripecustomerid || undefined;
        token.stripesubscriptionid = session.user.stripesubscriptionid || undefined;
        token.usage = session.user.usage;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.membership = token.membership as string;
        session.user.name = token.name || "";
        session.user.image = token.picture as string;
        session.user.stripecustomerid = token.stripecustomerid as string | undefined;
        session.user.stripesubscriptionid = token.stripesubscriptionid as string | undefined;
        session.user.usage = token.usage as string;
      }
      return session;
    },
  },
});
