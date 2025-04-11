// Remove unused imports if any

// Import the consolidated auth object
import { auth } from "@/app/(auth)/auth";

// Export the auth function directly as the middleware
export default auth;

// Keep the existing matcher config
export const config = {
  matcher: ["/", "/:id", "/login", "/register"],
};
