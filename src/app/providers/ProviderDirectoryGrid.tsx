"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { ProviderCard, type ProviderCardData } from "@/components/ProviderCard";
import { Button, EmptyState } from "@/components/ui";

// [Template] — Client component that fetches provider directory results and renders them in a responsive grid.

interface ProviderDirectoryGridProps {
  q: string;
  city: string;
  radius: string;
  format: string;
  page: string;
}

interface DirectoryResponse {
  providers: ProviderCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PAGE_SIZE = 12;

export function ProviderDirectoryGrid({
  q,
  city,
  radius,
  format,
  page,
}: ProviderDirectoryGridProps) {
  const router = useRouter();
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  const [data, setData] = useState<DirectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (radius) params.set("radius", radius);
    if (format) params.set("format", format);
    params.set("page", String(currentPage));
    params.set("pageSize", String(PAGE_SIZE));

    try {
      const res = await fetch(`/api/providers/directory?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch providers");
      const json: DirectoryResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load providers"
      );
    } finally {
      setLoading(false);
    }
  }, [q, city, radius, format, currentPage]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  /* ── Navigate to a different page ───────────────────────── */
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (radius && radius !== "25") params.set("radius", radius);
    if (format) params.set("format", format);
    if (newPage > 1) params.set("page", String(newPage));

    const qs = params.toString();
    router.push(`/providers${qs ? `?${qs}` : ""}`);
  };

  /* ── Loading state ─────────────────────────────────────── */
  if (loading) {
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

  /* ── Error state ───────────────────────────────────────── */
  if (error) {
    return (
      <EmptyState
        icon={Users}
        title="Something went wrong"
        description={error}
        action={
          <Button variant="secondary" size="sm" onClick={fetchProviders}>
            Try again
          </Button>
        }
      />
    );
  }

  /* ── Empty state ───────────────────────────────────────── */
  if (!data || data.providers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No providers found"
        description="Try adjusting your search filters or broadening your location."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/providers")}
          >
            Clear filters
          </Button>
        }
      />
    );
  }

  /* ── Results grid ──────────────────────────────────────── */
  return (
    <>
      {/* Result count */}
      <p className="text-sm text-muted mb-4">
        Showing{" "}
        {(currentPage - 1) * PAGE_SIZE + 1}
        &ndash;
        {Math.min(currentPage * PAGE_SIZE, data.total)} of {data.total}{" "}
        provider{data.total !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, current, and neighbors
                if (p === 1 || p === data.totalPages) return true;
                if (Math.abs(p - currentPage) <= 1) return true;
                return false;
              })
              .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                if (idx > 0) {
                  const prev = arr[idx - 1];
                  if (p - prev > 1) acc.push("ellipsis");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-sm text-muted"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    className={`w-8 h-8 rounded-[var(--ds-radius-sm)] text-sm font-medium transition-colors ${
                      item === currentPage
                        ? "bg-primary text-white"
                        : "text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= data.totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </nav>
      )}
    </>
  );
}
