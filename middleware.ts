// Remove unused imports if any

// Import the consolidated auth object
// import { auth } from "@/app/(auth)/auth";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // Import the Edge-safe config

// Initialize NextAuth with only the Edge-safe config for the middleware
export default NextAuth(authConfig).auth;

// Keep the existing matcher config
export const config = {
  // Refined matcher: Explicitly protect / and /tasks/*, handle auth routes
  matcher: ["/login", "/register", "/", "/tasks/:path*", "/api/tasks"],
};