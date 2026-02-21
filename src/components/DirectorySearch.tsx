"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, X, SlidersHorizontal } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";

// [Template] — Search and filter bar for the public provider directory.
// Adjust filter options, radius values, and terminology to match your domain.

interface DirectorySearchProps {
  /** Available service format options fetched from the API (e.g., ["In-person", "Online"]) */
  serviceFormats?: string[];
}

const RADIUS_OPTIONS = [
  { label: "10 miles", value: "10" },
  { label: "25 miles", value: "25" },
  { label: "50 miles", value: "50" },
  { label: "100 miles", value: "100" },
];

export function DirectorySearch({ serviceFormats }: DirectorySearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialise from URL params
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("city") ?? "");
  const [radius, setRadius] = useState(searchParams.get("radius") ?? "25");
  const [format, setFormat] = useState(searchParams.get("format") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  // Location autocomplete state
  const [suggestions, setSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Build URL & navigate ────────────────────────────────── */
  const applySearch = useCallback(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("city", location.trim());
    if (radius && radius !== "25") params.set("radius", radius);
    if (format) params.set("format", format);

    const qs = params.toString();
    router.push(`/providers${qs ? `?${qs}` : ""}`);
  }, [query, location, radius, format, router]);

  /* ── Debounced text search ───────────────────────────────── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applySearch();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  /* ── Location autocomplete ───────────────────────────────── */
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.predictions ?? []);
        setShowSuggestions(true);
      }
    } catch {
      // silently ignore autocomplete errors
    }
  }, []);

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const selectSuggestion = (description: string) => {
    setLocation(description);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── Clear all filters ────────────────────────────────────── */
  const clearFilters = () => {
    setQuery("");
    setLocation("");
    setRadius("25");
    setFormat("");
    router.push("/providers");
  };

  const hasFilters =
    query.trim() || location.trim() || radius !== "25" || format;

  return (
    <div className="space-y-4">
      {/* Main search row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Text search */}
        <div className="flex-1 relative">
          <Input
            label="Search providers"
            placeholder="Search by name, service, or specialty..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-[34px] w-4 h-4 text-muted pointer-events-none" />
        </div>

        {/* Location */}
        <div className="flex-1 relative" ref={locationRef}>
          <Input
            label="Location"
            placeholder="City or zip code"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          <MapPin className="absolute right-3 top-[34px] w-4 h-4 text-muted pointer-events-none" />

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full bg-surface border border-border rounded-[var(--ds-radius-default)] shadow-md max-h-48 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.place_id}
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors truncate"
                  onClick={() => selectSuggestion(s.description)}
                >
                  {s.description}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <div className="flex gap-2 sm:pb-0">
          <Button onClick={applySearch} className="whitespace-nowrap">
            <Search className="w-4 h-4 mr-1.5" />
            Search
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowFilters((v) => !v)}
            className="sm:hidden"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters row — always visible on desktop, toggleable on mobile */}
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-end ${
          showFilters ? "block" : "hidden sm:flex"
        }`}
      >
        {/* Radius */}
        <div className="w-full sm:w-40">
          <Select
            label="Radius"
            value={radius}
            onChange={(e) => {
              setRadius(e.target.value);
            }}
          >
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Service format filter */}
        {serviceFormats && serviceFormats.length > 0 && (
          <div className="w-full sm:w-48">
            <Select
              label="Service format"
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
              }}
            >
              <option value="">All formats</option>
              {serviceFormats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted hover:text-foreground"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
