import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { calculateDistanceKm, calculateMatchingScore, estimateEtaMinutes } from "@/lib/utils/distance";
import { fail, ok } from "@/lib/utils/response";
import { bookServiceSchema } from "@/lib/validation/booking";

type RankedCandidate = {
  tech: {
    id: string;
    acceptanceRate: number;
    avgRating: number;
    currentLat: unknown;
    currentLng: unknown;
    orders: { id: string }[];
  };
  distanceKm: number;
  etaMinutes: number;
  matchingScore: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookServiceSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid booking payload", 422, parsed.error.flatten());
    }

    const data = parsed.data;

    const [city, service] = await Promise.all([
      prisma.city.findUnique({ where: { slug: data.location.citySlug } }),
      prisma.service.findUnique({ where: { id: data.serviceId } }),
    ]);

    if (!city || !city.isActive) {
      return fail("Selected city is not serviceable yet", 404);
    }

    if (!service || !service.isActive) {
      return fail("Service is unavailable", 404);
    }

    const onlineTechnicians = await prisma.technician.findMany({
      where: {
        isOnline: true,
        verificationStatus: "VERIFIED",
        primaryCityId: city.id,
        serviceMappings: {
          some: {
            serviceId: service.id,
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

    const rankedCandidates: RankedCandidate[] = onlineTechnicians
      .filter((tech: (typeof onlineTechnicians)[number]) => tech.currentLat && tech.currentLng)
      .map((tech: (typeof onlineTechnicians)[number]) => {
        const distanceKm = calculateDistanceKm(
          { lat: Number(tech.currentLat), lng: Number(tech.currentLng) },
          { lat: data.location.lat, lng: data.location.lng },
        );

        const matchingScore = calculateMatchingScore({
          distanceKm,
          acceptanceRate: tech.acceptanceRate,
          avgRating: tech.avgRating,
          activeJobs: tech.orders.length,
        });

        return {
          tech,
          distanceKm,
          etaMinutes: estimateEtaMinutes(distanceKm),
          matchingScore,
        };
      })
      .sort((a: RankedCandidate, b: RankedCandidate) => a.matchingScore - b.matchingScore);

    const topCandidate = rankedCandidates[0];

    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        technicianId: topCandidate?.tech.id,
        serviceId: data.serviceId,
        cityId: city.id,
        status: topCandidate ? "PENDING_ASSIGNMENT" : "PENDING",
        issueType: data.issueType,
        issueNotes: data.issueNotes,
        preferredTime: data.preferredTime ? new Date(data.preferredTime) : null,
        estimatedEtaMinutes: topCandidate?.etaMinutes ?? 35,
        estimatedAmountPaise: service.basePriceInPaise,
        paymentStatus: "PENDING",
        location: {
          create: {
            addressLine: data.location.addressLine,
            landmark: data.location.landmark,
            floor: data.location.floor,
            lat: data.location.lat,
            lng: data.location.lng,
            cityId: city.id,
          },
        },
        events: {
          create: [
            {
              type: "order.created",
              payloadJson: {
                source: "customer-web",
              },
            },
            ...(topCandidate
              ? [
                  {
                    type: "dispatch.offer.sent",
                    payloadJson: {
                      technicianId: topCandidate.tech.id,
                      matchingScore: topCandidate.matchingScore,
                    },
                  },
                ]
              : []),
          ],
        },
      },
      include: {
        technician: {
          include: { user: true },
        },
      },
    });

    return ok({
      orderId: order.id,
      status: order.status,
      estimatedEtaMinutes: order.estimatedEtaMinutes,
      estimatedAmountPaise: order.estimatedAmountPaise,
      technician:
        order.technician && order.technician.user
          ? {
              id: order.technician.id,
              name: order.technician.user.name,
              avgRating: order.technician.avgRating,
            }
          : null,
    });
  } catch (error) {
    return fail("Unable to create booking", 500, error);
  }
}
