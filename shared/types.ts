// Shared type definitions used by both the web and mobile apps.

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "PROVIDER" | "CONSUMER" | "PARENT";
  isAdmin: boolean;
  providerId: string | null;
  consumerIds: string[];
  profileImage: string | null;
}

export interface LoginResponse {
  token: string;
  user: SessionUser;
}
