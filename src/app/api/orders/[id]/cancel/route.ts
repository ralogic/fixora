import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";
import { createNotification } from "@/server/modules/notifications/service";
import { enforceSameOrigin } from "@/lib/security/csrf";
import { emitOrderStatusUpdate } from "@/lib/socket/realtime";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/cancel
 *
 * Cancels an order that is still in a cancellable state.
 * Body: { reason?: string }
 */
export async function POST(request: NextRequest, context: Params) {
  try {
    if (!enforceSameOrigin(request)) {
      return fail("Invalid request origin", 403);
    }

    const user = await requireRole("CUSTOMER");
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = (body?.reason as string | undefined) ?? null;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return fail("Order not found", 404);
    }

    if (order.customerId !== user.id) {
      return fail("Forbidden", 403);
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

    if (order.technicianId) {
      await createNotification({
        userId: order.technicianId,
        type: "JOB_CANCELED",
        message: "A customer canceled a job that was assigned to you.",
        payload: { orderId: id, reason },
      });
    }

    await emitOrderStatusUpdate({
      orderId: updated.id,
      status: updated.status,
      cityId: order.cityId,
      technicianId: order.technicianId,
    });

    return ok({ orderId: updated.id, status: updated.status });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Cancellation failed", 500, error);
  }
}
