// Shared API endpoint constants used by both the web and mobile apps.

export const API = {
  // Auth
  login: "/api/auth/mobile-login",
  register: "/api/auth/register",
  changePassword: "/api/auth/change-password",

  // User
  userProfile: "/api/consumer/profile",
  providerProfile: "/api/provider/profile",

  // Bookings
  bookings: "/api/bookings",

  // Feedback
  feedback: "/api/feedback",
} as const;
