import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

// [Template] — NextAuth configuration with credentials provider, JWT strategy, and role-based session callbacks.

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            providerProfile: true,
            consumerProfiles: true,
          },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) return null;

        // Block unverified providers
        if (user.providerProfile && !user.emailVerified) {
          return null;
        }

        const profileImage =
          user.providerProfile?.profileImageUrl ??
          user.consumerProfiles.find((s) => s.profileImageUrl)?.profileImageUrl ??
          null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: user.isAdmin,
          providerId: user.providerProfile?.id ?? null,
          consumerIds: user.consumerProfiles.map((s) => s.id),
          profileImage,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as any).role;
        token.isAdmin = (user as any).isAdmin;
        token.providerId = (user as any).providerId;
        token.consumerIds = (user as any).consumerIds;
        token.profileImage = (user as any).profileImage;
      }

      // Re-fetch profileImage from DB when session is updated (e.g. after profile save)
      if (trigger === "update" && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { providerProfile: true, consumerProfiles: true },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.profileImage =
            dbUser.providerProfile?.profileImageUrl ??
            dbUser.consumerProfiles.find((s) => s.profileImageUrl)?.profileImageUrl ??
            null;
        }
      }

      // If providerId is missing, try to resolve it from DB
      if (token.role === "PROVIDER" && !token.providerId && token.sub) {
        const provider = await prisma.provider.findUnique({
          where: { userId: token.sub },
        });
        if (provider) {
          token.providerId = provider.id;
          if (!token.profileImage) token.profileImage = provider.profileImageUrl;
        }
      }

      // If consumerIds is missing or empty, try to resolve from DB
      if (
        (token.role === "CONSUMER" || token.role === "PARENT") &&
        (!token.consumerIds || (token.consumerIds as string[]).length === 0) &&
        token.sub
      ) {
        const consumers = await prisma.consumer.findMany({
          where: { userId: token.sub },
        });
        token.consumerIds = consumers.map((s) => s.id);
        if (!token.profileImage) {
          token.profileImage = consumers.find((s) => s.profileImageUrl)?.profileImageUrl ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).providerId = token.providerId;
        (session.user as any).consumerIds = token.consumerIds;
        (session.user as any).profileImage = token.profileImage;
      }
      return session;
    },
  },
});
