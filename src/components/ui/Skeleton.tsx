import type { HTMLAttributes } from "react";

// [Template] — Skeleton loading placeholders for cards, text, and tables.

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface-hover rounded ${className}`}
      {...props}
    />
  );
}

function BookingCardSkeleton() {
  return (
    <div className="bg-surface rounded-[var(--ds-radius-lg)] border border-border p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}

export { Skeleton, BookingCardSkeleton };
export type { SkeletonProps };
