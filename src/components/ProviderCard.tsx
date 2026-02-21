"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, DollarSign } from "lucide-react";
import { Card, Badge, StarRating } from "@/components/ui";

// [Template] — Provider card for the public directory listing.
// Rename "provider" / "service" to match your domain (e.g., "teacher" / "lesson").

export interface ProviderCardData {
  id: string;
  slug: string;
  name: string;
  businessName?: string | null;
  profileImage?: string | null;
  city?: string | null;
  state?: string | null;
  // [Template] Service formats offered (e.g., "In-person", "Online", "Group")
  serviceFormats?: string[];
  rateMin?: number | null;
  rateMax?: number | null;
  experienceYears?: number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  distance?: number | null;
  bio?: string | null;
}

interface ProviderCardProps {
  provider: ProviderCardData;
}

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
  if (min != null && max != null && min !== max) {
    return `$${min}–$${max}`;
  }
  return `$${min ?? max}`;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const rate = formatRate(provider.rateMin, provider.rateMax);
  const location =
    provider.city && provider.state
      ? `${provider.city}, ${provider.state}`
      : provider.city || provider.state || null;

  return (
    <Link href={`/providers/${provider.slug}`} className="block group">
      <Card className="h-full transition-all duration-200 group-hover:shadow-md group-hover:border-primary/20">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {provider.profileImage ? (
              <Image
                src={provider.profileImage}
                alt={provider.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {getInitials(provider.name)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {provider.name}
            </h3>
            {provider.businessName && (
              <p className="text-sm text-muted truncate">
                {provider.businessName}
              </p>
            )}
          </div>
        </div>

        {/* Location & distance */}
        {(location || provider.distance != null) && (
          <div className="mt-3 flex items-center gap-1 text-sm text-muted">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {location}
              {provider.distance != null && (
                <span className="ml-1 text-primary font-medium">
                  ({provider.distance.toFixed(1)} mi)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Rating */}
        {provider.averageRating != null && provider.averageRating > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <StarRating
              value={Math.round(provider.averageRating)}
              readOnly
              size="sm"
            />
            <span className="text-sm text-muted">
              {provider.averageRating.toFixed(1)}
              {provider.reviewCount != null && provider.reviewCount > 0 && (
                <span className="ml-1">
                  ({provider.reviewCount} review{provider.reviewCount !== 1 ? "s" : ""})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Service format badges */}
        {provider.serviceFormats && provider.serviceFormats.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {provider.serviceFormats.map((format) => (
              <Badge key={format} variant="primary">
                {format}
              </Badge>
            ))}
          </div>
        )}

        {/* Rate & experience row */}
        <div className="mt-3 flex items-center gap-4 text-sm text-muted">
          {rate && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {rate}
            </span>
          )}
          {provider.experienceYears != null && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {provider.experienceYears} yr{provider.experienceYears !== 1 ? "s" : ""} exp
            </span>
          )}
        </div>

        {/* Bio excerpt */}
        {provider.bio && (
          <p className="mt-3 text-sm text-muted line-clamp-2">
            {provider.bio}
          </p>
        )}
      </Card>
    </Link>
  );
}
