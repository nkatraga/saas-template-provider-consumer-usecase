import { Suspense } from "react";
import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";
import { DirectorySearch } from "@/components/DirectorySearch";
import { ProviderDirectoryGrid } from "./ProviderDirectoryGrid";

// [Template] — Public provider directory listing page.
// This is a server component wrapper; interactivity lives in DirectorySearch and ProviderDirectoryGrid.

export const metadata = {
  title: "Find a Provider | AppName",
  description:
    "Browse our directory of qualified providers. Search by name, location, service type, and more.",
};

// [Template] Available service format options. Fetch from your API or hard-code here.
const SERVICE_FORMATS = ["In-person", "Online", "Hybrid"];

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Normalise search params (Next.js 16 returns Promise<...>)
  const q = typeof params.q === "string" ? params.q : "";
  const city = typeof params.city === "string" ? params.city : "";
  const radius = typeof params.radius === "string" ? params.radius : "25";
  const format = typeof params.format === "string" ? params.format : "";
  const page = typeof params.page === "string" ? params.page : "1";

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
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl text-foreground">
            {/* [Template] Customize the directory heading */}
            Find a provider
          </h1>
          <p className="mt-2 text-muted text-lg">
            {/* [Template] Customize the directory subheading */}
            Browse our directory of qualified providers near you.
          </p>
        </div>

        {/* Search & filters */}
        <Suspense>
          <DirectorySearch serviceFormats={SERVICE_FORMATS} />
        </Suspense>

        {/* Results grid */}
        <div className="mt-8">
          <Suspense fallback={<DirectoryGridSkeleton />}>
            <ProviderDirectoryGrid
              q={q}
              city={city}
              radius={radius}
              format={format}
              page={page}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

/* ── Loading skeleton shown while results stream in ────── */
function DirectoryGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface rounded-[var(--ds-radius-lg)] border border-border p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-surface-hover animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-hover rounded animate-pulse w-2/3" />
              <div className="h-3 bg-surface-hover rounded animate-pulse w-1/2" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-surface-hover rounded animate-pulse w-full" />
            <div className="h-3 bg-surface-hover rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
