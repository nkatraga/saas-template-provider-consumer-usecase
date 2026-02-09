import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import PostHogProvider from "@/components/PostHogProvider";

// [Template] — Root layout with providers, fonts, and global metadata. Wrap children with your app's providers.

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://example.com"
  ),
  title: "AppName",
  description:
    "The provider-consumer SaaS platform for scheduling, bookings, and business management.",
  openGraph: {
    siteName: "AppName",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <PostHogProvider>{children}</PostHogProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
