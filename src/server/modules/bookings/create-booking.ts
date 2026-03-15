import { prisma } from "@/lib/prisma/client";
import type { BookingCreationResult, BookingRequest } from "@/types/domain";
import { getRankedTechnicianCandidates, pickDispatchCandidate } from "@/server/modules/technicians/search";
import { createNotification } from "@/server/modules/notifications/service";
import { emitDispatchOffer, emitOrderStatusUpdate } from "@/lib/socket/realtime";

export class BookingCreationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "BookingCreationError";
  }
}

export async function createBooking(input: BookingRequest): Promise<BookingCreationResult> {
  const [city, service] = await Promise.all([
    prisma.city.findUnique({ where: { slug: input.location.citySlug } }),
    prisma.service.findUnique({ where: { id: input.serviceId } }),
  ]);

  if (!city || !city.isActive) {
    throw new BookingCreationError("Selected city is not serviceable yet", 404);
  }

  if (!service || !service.isActive) {
    throw new BookingCreationError("Service is unavailable", 404);
  }

  const rankedSearch = await getRankedTechnicianCandidates({
    cityId: city.id,
    serviceId: input.serviceId,
    lat: input.location.lat,
    lng: input.location.lng,
    limit: 50,
  });

  const rankedCandidates = rankedSearch?.results ?? [];
  const { preferredCandidate, selectedCandidate } = pickDispatchCandidate(
    rankedCandidates,
    input.preferredTechnicianId,
  );

  const order = await prisma.order.create({
    data: {
      customerId: input.customerId,
      technicianId: selectedCandidate?.technicianId,
      serviceId: input.serviceId,
      cityId: city.id,
      status: selectedCandidate ? "PENDING_ASSIGNMENT" : "PENDING",
      issueType: input.issueType,
      issueNotes: input.issueNotes,
      preferredTime: input.preferredTime ? new Date(input.preferredTime) : null,
      estimatedEtaMinutes: selectedCandidate?.etaMinutes ?? 35,
      estimatedAmountPaise: service.basePriceInPaise,
      paymentStatus: "PENDING",
      location: {
        create: {
          addressLine: input.location.addressLine,
          landmark: input.location.landmark,
          floor: input.location.floor,
          lat: input.location.lat,
          lng: input.location.lng,
          cityId: city.id,
        },
      },
      events: {
        create: [
          {
            type: "order.created",
            payloadJson: {
              source: "customer-web",
              preferredTechnicianId: input.preferredTechnicianId ?? null,
            },
          },
          ...(selectedCandidate
            ? [
                {
                  type: "dispatch.offer.sent",
                  payloadJson: {
                    technicianId: selectedCandidate.technicianId,
                    matchingScore: selectedCandidate.matchingScore,
                    source: preferredCandidate ? "preferred" : "auto-ranked",
                  },
                },
              ]
            : []),
        ],
      },
      ...(selectedCandidate
        ? {
            assignmentAttempts: {
              create: {
                technicianId: selectedCandidate.technicianId,
                response: null,
              },
            },
          }
        : {}),
    },
    include: {
      technician: {
        include: { user: true },
      },
    },
  });

  await createNotification({
    userId: order.customerId,
    type: "BOOKING_CONFIRMED",
    message: "Your booking request has been created successfully.",
    payload: { orderId: order.id, status: order.status },
  });

  if (selectedCandidate) {
    await createNotification({
      userId: selectedCandidate.technicianId,
      type: "NEW_JOB_REQUEST",
      message: "A new booking request is available for your acceptance.",
      payload: { orderId: order.id, serviceId: order.serviceId },
    });

    await emitDispatchOffer({
      orderId: order.id,
      technicianId: selectedCandidate.technicianId,
      serviceId: order.serviceId,
      cityId: order.cityId,
      etaMinutes: order.estimatedEtaMinutes,
    });
  }

  await emitOrderStatusUpdate({
    orderId: order.id,
    status: order.status,
    cityId: order.cityId,
    technicianId: order.technicianId,
  });

  return {
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
  };
}
