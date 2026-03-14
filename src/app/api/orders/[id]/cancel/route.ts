import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/cancel
 *
 * Cancels an order that is still in a cancellable state.
 * Body: { reason?: string }
 */
export async function POST(request: NextRequest, context: Params) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = (body?.reason as string | undefined) ?? null;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return fail("Order not found", 404);
    }

    const cancellableStatuses = ["PENDING", "PENDING_ASSIGNMENT", "ASSIGNED"];
    if (!cancellableStatuses.includes(order.status)) {
      return fail(
        `Cannot cancel an order with status ${order.status}. Only orders that are pending or assigned can be cancelled.`,
        409,
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: {
          status: "CANCELED",
          cancellationReason: reason,
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: id,
          type: "CANCELED",
          payloadJson: { reason, cancelledBy: "customer" },
        },
      });

      return o;
    });

    return ok({ orderId: updated.id, status: updated.status });
  } catch (error) {
    return fail("Cancellation failed", 500, error);
  }
}
