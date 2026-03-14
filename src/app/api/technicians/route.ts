import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { calculateDistanceKm, calculateMatchingScore, estimateEtaMinutes } from "@/lib/utils/distance";
import { fail, ok } from "@/lib/utils/response";

type RankedTechnician = {
  technicianId: string;
  name: string;
  distanceKm: number;
  etaMinutes: number;
  avgRating: number;
  acceptanceRate: number;
  activeJobs: number;
  matchingScore: number;
};

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

    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      return fail("City not found", 404);
    }

    const technicians = await prisma.technician.findMany({
      where: {
        isOnline: true,
        verificationStatus: "VERIFIED",
        primaryCityId: city.id,
        serviceMappings: {
          some: {
            serviceId,
          },
        },
      },
      include: {
        user: true,
        orders: {
          where: {
            status: {
              in: ["ASSIGNED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"],
            },
          },
          select: { id: true },
        },
      },
      take: 50,
    });

    const ranked: RankedTechnician[] = technicians
      .filter((tech: (typeof technicians)[number]) => tech.currentLat && tech.currentLng)
      .map((tech: (typeof technicians)[number]) => {
        const distanceKm = calculateDistanceKm(
          { lat: Number(tech.currentLat), lng: Number(tech.currentLng) },
          { lat, lng },
        );

        return {
          technicianId: tech.id,
          name: tech.user.name,
          distanceKm,
          etaMinutes: estimateEtaMinutes(distanceKm),
          avgRating: tech.avgRating,
          acceptanceRate: tech.acceptanceRate,
          activeJobs: tech.orders.length,
          matchingScore: calculateMatchingScore({
            distanceKm,
            acceptanceRate: tech.acceptanceRate,
            avgRating: tech.avgRating,
            activeJobs: tech.orders.length,
          }),
        };
      })
      .sort((a: RankedTechnician, b: RankedTechnician) => a.matchingScore - b.matchingScore)
      .slice(0, 10);

    return ok({ city: city.slug, results: ranked });
  } catch (error) {
    return fail("Unable to load technicians", 500, error);
  }
}
