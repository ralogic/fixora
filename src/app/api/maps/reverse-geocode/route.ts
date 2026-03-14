import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const lat = Number(request.nextUrl.searchParams.get("lat"));
    const lng = Number(request.nextUrl.searchParams.get("lng"));

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return fail("lat and lng are required", 422);
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return ok({ formattedAddress: `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}` });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
      { cache: "no-store" },
    );

    const data = (await response.json()) as {
      results?: Array<{ formatted_address?: string }>;
      status?: string;
    };

    if (data.status !== "OK" || !data.results?.length) {
      return ok({ formattedAddress: `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}` });
    }

    return ok({ formattedAddress: data.results[0]?.formatted_address ?? "Unknown address" });
  } catch (error) {
    return fail("Unable to reverse geocode", 500, error);
  }
}
