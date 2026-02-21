"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Clock,
  DollarSign,
  Camera,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Card, Badge, StarRating, Button } from "@/components/ui";
import { EnrollmentForm } from "@/components/EnrollmentForm";

// [Template] — Client-side content for the provider detail page.
// Includes hero, bio, services, gallery, reviews, and enrollment form sections.

/* ── Types ──────────────────────────────────────────────── */

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
}

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
  reviews?: Review[];
  photos?: Photo[];
}

interface ProviderDetailContentProps {
  provider: ProviderDetailData;
}

/* ── Helpers ─────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRate(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) return `$${min}–$${max}`;
  return `$${min ?? max}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ── Component ───────────────────────────────────────────── */

export function ProviderDetailContent({
  provider,
}: ProviderDetailContentProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const location =
    provider.city && provider.state
      ? `${provider.city}, ${provider.state}`
      : provider.city || provider.state || null;
  const rate = formatRate(provider.rateMin, provider.rateMax);
  const hasPhotos = provider.photos && provider.photos.length > 0;
  const hasReviews = provider.reviews && provider.reviews.length > 0;

  return (
    <div className="space-y-10">
      {/* ── Hero section ──────────────────────────────────── */}
      <section className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile image */}
        <div className="flex-shrink-0">
          {provider.profileImage ? (
            <Image
              src={provider.profileImage}
              alt={provider.name}
              width={160}
              height={160}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border border-border"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-primary/10 flex items-center justify-center border border-border">
              <span className="text-4xl font-semibold text-primary">
                {getInitials(provider.name)}
              </span>
            </div>
          )}
        </div>

        {/* Name, business, and quick stats */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl text-foreground">
            {provider.name}
          </h1>
          {provider.businessName && (
            <p className="mt-1 text-lg text-muted">{provider.businessName}</p>
          )}

          {/* Quick stats row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {location}
              </span>
            )}
            {provider.experienceYears != null && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {provider.experienceYears} year{provider.experienceYears !== 1 ? "s" : ""}{" "}
                experience
              </span>
            )}
            {rate && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                {rate}
              </span>
            )}
          </div>

          {/* Rating */}
          {provider.averageRating != null && provider.averageRating > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <StarRating
                value={Math.round(provider.averageRating)}
                readOnly
                size="md"
                showValue
              />
              {provider.reviewCount != null && provider.reviewCount > 0 && (
                <span className="text-sm text-muted">
                  ({provider.reviewCount} review
                  {provider.reviewCount !== 1 ? "s" : ""})
                </span>
              )}
            </div>
          )}

          {/* Service format badges */}
          {provider.serviceFormats && provider.serviceFormats.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {provider.serviceFormats.map((format) => (
                <Badge key={format} variant="primary">
                  {format}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Bio & philosophy ─────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: bio + philosophy */}
        <div className="lg:col-span-2 space-y-8">
          {provider.bio && (
            <Card>
              <h2 className="text-xl text-foreground mb-3">
                {/* [Template] Customize heading */}
                About
              </h2>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {provider.bio}
              </p>
            </Card>
          )}

          {provider.philosophy && (
            <Card>
              <h2 className="text-xl text-foreground mb-3">
                {/* [Template] Customize heading (e.g., "Teaching Philosophy", "Our Approach") */}
                Approach &amp; Philosophy
              </h2>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {provider.philosophy}
              </p>
            </Card>
          )}

          {/* ── Photo gallery ────────────────────────────── */}
          {hasPhotos && (
            <Card>
              <h2 className="text-xl text-foreground mb-4">
                <Camera className="w-5 h-5 inline-block mr-2 -mt-0.5" />
                Photos
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {provider.photos!.map((photo, idx) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Photo ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* ── Reviews ──────────────────────────────────── */}
          {hasReviews && (
            <Card>
              <h2 className="text-xl text-foreground mb-4">
                <MessageSquare className="w-5 h-5 inline-block mr-2 -mt-0.5" />
                Reviews
              </h2>
              <div className="space-y-6">
                {provider.reviews!.map((review) => (
                  <div
                    key={review.id}
                    className="pb-6 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {review.authorName}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <StarRating
                      value={review.rating}
                      readOnly
                      size="sm"
                    />
                    {review.comment && (
                      <p className="mt-2 text-sm text-muted leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column: service details + enrollment form */}
        <div className="space-y-6">
          {/* Service details card */}
          <Card>
            <h2 className="text-xl text-foreground mb-4">
              {/* [Template] Customize heading (e.g., "Lesson Details", "Services Offered") */}
              Service Details
            </h2>
            <dl className="space-y-3 text-sm">
              {provider.serviceFormats &&
                provider.serviceFormats.length > 0 && (
                  <div>
                    <dt className="font-medium text-foreground">Formats</dt>
                    <dd className="text-muted mt-0.5">
                      {provider.serviceFormats.join(", ")}
                    </dd>
                  </div>
                )}
              {rate && (
                <div>
                  <dt className="font-medium text-foreground">Rates</dt>
                  <dd className="text-muted mt-0.5">{rate}</dd>
                </div>
              )}
              {provider.experienceYears != null && (
                <div>
                  <dt className="font-medium text-foreground">Experience</dt>
                  <dd className="text-muted mt-0.5">
                    {provider.experienceYears} year
                    {provider.experienceYears !== 1 ? "s" : ""}
                  </dd>
                </div>
              )}
              {location && (
                <div>
                  <dt className="font-medium text-foreground">Location</dt>
                  <dd className="text-muted mt-0.5">{location}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Enrollment / inquiry form */}
          <Card>
            <h2 className="text-xl text-foreground mb-4">
              {/* [Template] Customize heading (e.g., "Request a Lesson", "Get in Touch") */}
              Get in touch
            </h2>
            <EnrollmentForm
              providerId={provider.id}
              providerName={provider.name}
              serviceTypes={provider.serviceFormats}
            />
          </Card>
        </div>
      </div>

      {/* ── Lightbox overlay ─────────────────────────────── */}
      {lightboxIndex !== null && hasPhotos && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous */}
          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={() => setLightboxIndex((i) => (i ?? 1) - 1)}
              className="absolute left-4 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {/* Next */}
          {lightboxIndex < provider.photos!.length - 1 && (
            <button
              type="button"
              onClick={() => setLightboxIndex((i) => (i ?? 0) + 1)}
              className="absolute right-4 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}

          {/* Image */}
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
            <Image
              src={provider.photos![lightboxIndex].url}
              alt={
                provider.photos![lightboxIndex].caption ||
                `Photo ${lightboxIndex + 1}`
              }
              fill
              className="object-contain"
            />
          </div>

          {/* Caption */}
          {provider.photos![lightboxIndex].caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm text-center max-w-md">
              {provider.photos![lightboxIndex].caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
