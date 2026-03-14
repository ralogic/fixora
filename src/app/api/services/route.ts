import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { estimateEtaMinutes } from "@/lib/utils/distance";
import { resolveZoneByCoordinates } from "@/lib/utils/zones";
import { fail, ok } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const lat = Number(request.nextUrl.searchParams.get("lat"));
    const lng = Number(request.nextUrl.searchParams.get("lng"));
    const citySlug = request.nextUrl.searchParams.get("city") ?? "jaipur";

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return fail("lat and lng are required", 422);
    }

    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city || !city.isActive) {
      return fail("City not serviceable", 404);
    }

    const coverage = await resolveZoneByCoordinates(city.id, lat, lng);

    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        cityOverrides: {
          where: { cityId: city.id },
        },
      },
      orderBy: { category: "asc" },
    });

    const onlineTechCount = await prisma.technician.count({
      where: {
        isOnline: true,
        verificationStatus: "VERIFIED",
        primaryCityId: city.id,
      },
    });

    const responseServices = services.map((service: (typeof services)[number]) => {
      const override = service.cityOverrides[0];
      const basePriceInPaise = override?.overridePrice ?? service.basePriceInPaise;
      const baseEta = coverage.confidence === "green" ? 22 : coverage.confidence === "amber" ? 35 : 50;
      const congestionPenalty = onlineTechCount > 0 ? 0 : 10;

      return {
        id: service.id,
        category: service.category,
        name: service.name,
        basePriceInPaise,
        estimatedArrivalTime: estimateEtaMinutes(baseEta / 4) + congestionPenalty,
      };
    });

    return ok({
      city: city.slug,
      zoneId: coverage.zoneId,
      zoneConfidence: coverage.confidence,
      services: responseServices,
    });
  } catch (error) {
    return fail("Unable to fetch services", 500, error);
  }
}
