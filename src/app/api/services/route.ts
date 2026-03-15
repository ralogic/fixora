import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { estimateEtaMinutes } from "@/lib/utils/distance";
import { resolveZoneByCoordinates } from "@/lib/utils/zones";
import { fail, ok } from "@/lib/utils/response";
import { SERVICE_CATEGORIES } from "@/lib/constants/services";
import {
  getPrismaConnectivityMessage,
  PrismaFastFailError,
  withPrismaFailFast,
} from "@/lib/utils/prisma-error";

export async function GET(request: NextRequest) {
  const citySlug = request.nextUrl.searchParams.get("city") ?? "jaipur";

  try {
    const lat = Number(request.nextUrl.searchParams.get("lat"));
    const lng = Number(request.nextUrl.searchParams.get("lng"));

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return fail("lat and lng are required", 422);
    }

    const city = await withPrismaFailFast(
      () => prisma.city.findUnique({ where: { slug: citySlug } }),
      { timeoutMs: 2000, backoffMs: 20000 },
    );
    if (!city || !city.isActive) {
      return fail("City not serviceable", 404);
    }

    const coverage = await withPrismaFailFast(
      () => resolveZoneByCoordinates(city.id, lat, lng),
      { timeoutMs: 2000, backoffMs: 20000 },
    );

    const services = await withPrismaFailFast(
      () =>
        prisma.service.findMany({
          where: { isActive: true },
          include: {
            cityOverrides: {
              where: { cityId: city.id },
            },
          },
          orderBy: { category: "asc" },
        }),
      { timeoutMs: 2000, backoffMs: 20000 },
    );

    const onlineTechCount = await withPrismaFailFast(
      () =>
        prisma.technician.count({
          where: {
            isOnline: true,
            verificationStatus: "VERIFIED",
            primaryCityId: city.id,
          },
        }),
      { timeoutMs: 2000, backoffMs: 20000 },
    );

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
    const connectivityMessage = getPrismaConnectivityMessage(error);
    if (connectivityMessage || error instanceof PrismaFastFailError) {
      return ok({
        city: citySlug,
        zoneId: null,
        zoneConfidence: "amber",
        degraded: true,
        services: SERVICE_CATEGORIES.map((service) => ({
          id: service.serviceId,
          category: service.key,
          name: service.title,
          basePriceInPaise: service.basePriceInr * 100,
          estimatedArrivalTime: service.etaMinutes,
        })),
      });
    }

    return fail("Unable to fetch services", 500, error);
  }
}
