import { handlers } from "@/lib/auth";

// [Template] — NextAuth route handler. Exports GET and POST for the catch-all auth route.
export const { GET, POST } = handlers;
