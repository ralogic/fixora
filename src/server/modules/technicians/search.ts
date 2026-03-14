import { prisma } from "@/lib/prisma/client";
import {
  calculateDistanceKm,
  calculateMatchingScore,
  estimateEtaMinutes,
} from "@/lib/utils/distance";
import type {
  RankedTechnicianCandidate,
  RankedTechnicianSearchInput,
  RankedTechnicianSearchResult,
} from "./contracts";

const ACTIVE_ORDER_STATUSES = ["ASSIGNED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"] as const;

async function resolveCity(input: RankedTechnicianSearchInput) {
  if (input.cityId) {
    const city = await prisma.city.findUnique({
      where: { id: input.cityId },
      select: { id: true, slug: true },
    });
    return city;
  }

  if (!input.citySlug) {
    throw new Error("cityId or citySlug is required");
  }

  return prisma.city.findUnique({
    where: { slug: input.citySlug },
    select: { id: true, slug: true },
  });
}

export async function getRankedTechnicianCandidates(
  input: RankedTechnicianSearchInput,
): Promise<RankedTechnicianSearchResult | null> {
  const city = await resolveCity(input);
  if (!city) {
    return null;
  }

  const technicians = await prisma.technician.findMany({
    where: {
      isOnline: true,
      verificationStatus: "VERIFIED",
      primaryCityId: city.id,
      serviceMappings: {
        some: {
          serviceId: input.serviceId,
        },
      },
    },
    include: {
      user: true,
      serviceMappings: {
        where: { serviceId: input.serviceId },
        include: { service: true },
        take: 1,
      },
      orders: {
        where: {
          status: {
            in: [...ACTIVE_ORDER_STATUSES],
          },
        },
        select: { id: true },
      },
    },
    take: 50,
  });

  const results: RankedTechnicianCandidate[] = technicians
    .filter((technician) => technician.currentLat && technician.currentLng)
    .map((technician) => {
      const distanceKm = calculateDistanceKm(
        { lat: Number(technician.currentLat), lng: Number(technician.currentLng) },
        { lat: input.lat, lng: input.lng },
      );

      return {
        technicianId: technician.id,
        name: technician.user.name,
        serviceCategory: technician.serviceMappings[0]?.service.category ?? "appliance",
        experienceYears: technician.experienceYears,
        completedJobs: technician.completedJobs,
        isOnline: technician.isOnline,
        profilePhotoUrl: technician.profilePhotoUrl,
        skills: Array.isArray(technician.skillsJson) ? (technician.skillsJson as string[]) : [],
        workType: technician.workType,
        distanceKm,
        etaMinutes: estimateEtaMinutes(distanceKm),
        avgRating: technician.avgRating,
        acceptanceRate: technician.acceptanceRate,
        activeJobs: technician.orders.length,
        matchingScore: calculateMatchingScore({
          distanceKm,
          acceptanceRate: technician.acceptanceRate,
          avgRating: technician.avgRating,
          activeJobs: technician.orders.length,
        }),
      };
    })
    .sort((left, right) => left.matchingScore - right.matchingScore)
    .slice(0, input.limit ?? 10);

  return {
    cityId: city.id,
    citySlug: city.slug,
    results,
  };
}

export function pickDispatchCandidate(
  candidates: RankedTechnicianCandidate[],
  preferredTechnicianId?: string,
) {
  const preferredCandidate = preferredTechnicianId
    ? candidates.find((candidate) => candidate.technicianId === preferredTechnicianId)
    : undefined;

  return {
    preferredCandidate,
    selectedCandidate: preferredCandidate ?? candidates[0],
  };
}
