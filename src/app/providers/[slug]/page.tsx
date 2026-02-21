import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";
import { ProviderDetailContent } from "./ProviderDetailContent";

// [Template] — Public provider profile / detail page.
// Rename "provider" to match your domain (e.g., "teacher", "instructor", "coach").

/* ── Types ──────────────────────────────────────────────── */

interface ProviderDetailData {
  id: string;
  slug: string;
  name: string;
  businessName?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  bio?: string | null;
  philosophy?: string | null;
  city?: string | null;
  state?: string | null;
  serviceFormats?: string[];
  rateMin?: number | null;
  rateMax?: number | null;
  experienceYears?: number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  reviews?: {
    id: string;
    authorName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  photos?: { id: string; url: string; caption?: string | null }[];
}

/* ── Data fetching helper ──────────────────────────────── */

async function getProvider(slug: string): Promise<ProviderDetailData | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/providers/directory/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/* ── SEO metadata ──────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProvider(slug);
  if (!provider) {
    return { title: "Provider not found | AppName" };
  }

  const title = provider.businessName
    ? `${provider.name} — ${provider.businessName} | AppName`
    : `${provider.name} | AppName`;

  const description =
    provider.bio?.slice(0, 160) ||
    `View ${provider.name}'s profile, services, and reviews on AppName.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(provider.profileImage && {
        images: [{ url: provider.profileImage }],
      }),
    },
  };
}

/* ── Page component ────────────────────────────────────── */

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = await getProvider(slug);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav — mirrors landing page */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border transition-all duration-300">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)] text-foreground">
              AppName
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-full px-5 py-2 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Back to directory */}
        <Link
          href="/providers"
          className="inline-flex items-center text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to directory
        </Link>

        {/* Not-found state */}
        {!provider ? (
          <div className="text-center py-20">
            <h1 className="text-2xl text-foreground mb-2">
              Provider not found
            </h1>
            <p className="text-muted mb-6">
              The provider you are looking for does not exist or has been
              removed.
            </p>
            <Link
              href="/providers"
              className="text-primary hover:underline text-sm font-medium"
            >
              Browse the directory
            </Link>
          </div>
        ) : (
          <ProviderDetailContent provider={provider} />
        )}
      </main>
    </div>
  );
}
