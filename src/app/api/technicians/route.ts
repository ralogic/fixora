import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils/response";
import { getRankedTechnicianCandidates } from "@/server/modules/technicians/search";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const citySlug = searchParams.get("city") ?? "jaipur";
    const serviceId = searchParams.get("serviceId");
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    if (!serviceId || Number.isNaN(lat) || Number.isNaN(lng)) {
      return fail("city, serviceId, lat, lng are required", 422);
    }

    const rankedSearch = await getRankedTechnicianCandidates({
      citySlug,
      serviceId,
      lat,
      lng,
    });

    if (!rankedSearch) {
      return fail("City not found", 404);
    }

    return ok({ city: rankedSearch.citySlug, results: rankedSearch.results });
  } catch (error) {
    return fail("Unable to load technicians", 500, error);
  }
}
