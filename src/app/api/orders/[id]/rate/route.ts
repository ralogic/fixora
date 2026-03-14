import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { z } from "zod";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

type Params = { params: Promise<{ id: string }> };

const rateSchema = z.object({
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
    const user = await requireRole("CUSTOMER");
    const { id } = await context.params;
    const body = await request.json();
    const parsed = rateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid rating payload", 422, parsed.error.flatten());
    }

    const { score, comment } = parsed.data;

    // Verify order exists, is completed, and belongs to this customer
    const order = await prisma.order.findUnique({
      where: { id },
      include: { rating: true },
    });
    if (!order) return fail("Order not found", 404);
    if (order.status !== "COMPLETED") return fail("Order is not completed yet", 409);
    if (order.customerId !== user.id) return fail("Forbidden", 403);
    if (!order.technicianId) return fail("Order has no assigned technician", 409);
    if (order.rating) return fail("This order has already been rated", 409);

    // Fetch technician for incremental average
    const technician = await prisma.technician.findUnique({
      where: { id: order.technicianId },
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
          customerId: user.id,
          technicianId: order.technicianId,
          score,
          comment: comment ?? null,
        },
      }),
      prisma.technician.update({
        where: { id: order.technicianId },
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
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Rating failed", 500, error);
  }
}
