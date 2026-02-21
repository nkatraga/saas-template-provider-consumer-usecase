import { NextRequest, NextResponse } from "next/server";

// [Template] -- Proxies Google Places Autocomplete API.
// Used for location search in provider profile setup and consumer address fields.

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    input,
    types: "(regions)",
    components: "country:us",
    key: GOOGLE_PLACES_API_KEY,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
  );
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return NextResponse.json(
      { error: data.error_message || "Places API error" },
      { status: 502 }
    );
  }

  const predictions = (data.predictions || []).map((p: any) => ({
    placeId: p.place_id,
    description: p.description,
  }));

  return NextResponse.json({ predictions });
}
