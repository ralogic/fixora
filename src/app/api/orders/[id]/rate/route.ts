import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const rateSchema = z.object({
  customerId: z.string().min(1),
  technicianId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

/**
 * POST /api/orders/[id]/rate
 *
 * Submits a customer rating for a completed order.
 * Also updates the technician's avgRating using an incremental average.
 */
export async function POST(request: NextRequest, context: Params) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = rateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid rating payload", 422, parsed.error.flatten());
    }

    const { customerId, technicianId, score, comment } = parsed.data;

    // Verify order exists, is completed, and belongs to this customer
    const order = await prisma.order.findUnique({
      where: { id },
      include: { rating: true },
    });
    if (!order) return fail("Order not found", 404);
    if (order.status !== "COMPLETED") return fail("Order is not completed yet", 409);
    if (order.customerId !== customerId) return fail("Forbidden", 403);
    if (order.rating) return fail("This order has already been rated", 409);

    // Fetch technician for incremental average
    const technician = await prisma.technician.findUnique({
      where: { id: technicianId },
      select: { avgRating: true, completedJobs: true },
    });
    if (!technician) return fail("Technician not found", 404);

    const newAvg =
      (technician.avgRating * technician.completedJobs + score) /
      (technician.completedJobs + 1);

    await prisma.$transaction([
      prisma.rating.create({
        data: {
          orderId: id,
          customerId,
          technicianId,
          score,
          comment: comment ?? null,
        },
      }),
      prisma.technician.update({
        where: { id: technicianId },
        data: {
          avgRating: Math.round(newAvg * 100) / 100,
          completedJobs: { increment: 0 }, // already counted at completion
        },
      }),
      prisma.orderEvent.create({
        data: {
          orderId: id,
          type: "RATED",
          payloadJson: { score, comment },
        },
      }),
    ]);

    return ok({ orderId: id, score, message: "Rating submitted" });
  } catch (error) {
    return fail("Rating failed", 500, error);
  }
}
