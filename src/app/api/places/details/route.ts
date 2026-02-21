import { NextRequest, NextResponse } from "next/server";

// [Template] -- Proxies Google Places Details API.
// Returns geocoded location data (city, state, zip, lat/lng) for a given placeId.

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields: "geometry,address_components,formatted_address",
    key: GOOGLE_PLACES_API_KEY,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  const data = await res.json();

  if (data.status !== "OK") {
    return NextResponse.json(
      { error: data.error_message || "Places API error" },
      { status: 502 }
    );
  }

  const result = data.result;
  const components = result.address_components || [];

  const getComponent = (type: string) =>
    components.find((c: any) => c.types.includes(type));

  const city = getComponent("locality")?.long_name || "";
  const state = getComponent("administrative_area_level_1")?.short_name || "";
  const zipCode = getComponent("postal_code")?.long_name || "";

  return NextResponse.json({
    placeId,
    city,
    state,
    zipCode,
    latitude: result.geometry?.location?.lat,
    longitude: result.geometry?.location?.lng,
    formattedAddress: result.formatted_address,
  });
}
