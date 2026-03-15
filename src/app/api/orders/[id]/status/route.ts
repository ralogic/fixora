import { NextRequest } from "next/server";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { enforceSameOrigin } from "@/lib/security/csrf";
import { AuthorizationError, requireRole } from "@/server/shared/authz";
import {
  assertOrderStatusTransition,
  assertRoleCanUpdateStatus,
  OrderStatusTransitionError,
} from "@/server/modules/bookings/status-machine";
import { createNotification } from "@/server/modules/notifications/service";
import { emitOrderStatusUpdate } from "@/lib/socket/realtime";

const schema = z.object({
  status: z.enum(["PENDING", "PENDING_ASSIGNMENT", "ASSIGNED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELED"]),
  note: z.string().max(300).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Params) {
  try {
    if (!enforceSameOrigin(request)) {
      return fail("Invalid request origin", 403);
    }

    const user = await requireRole(["TECHNICIAN", "ADMIN"]);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid status payload", 422, parsed.error.flatten());
    }

    const nextStatus = parsed.data.status as OrderStatus;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return fail("Order not found", 404);
    }

    assertRoleCanUpdateStatus(user.role, nextStatus);
    assertOrderStatusTransition(order.status, nextStatus);

    if (user.role === "TECHNICIAN" && order.technicianId !== user.id) {
      return fail("Forbidden", 403);
    }

    const now = new Date();
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: nextStatus,
        ...(nextStatus === "IN_PROGRESS" ? { startedAt: now } : {}),
        ...(nextStatus === "COMPLETED" ? { completedAt: now } : {}),
        events: {
          create: {
            type: "order.status.updated",
            payloadJson: {
              previousStatus: order.status,
              nextStatus,
              actorUserId: user.id,
              note: parsed.data.note ?? null,
            },
          },
        },
      },
    });

    await createNotification({
      userId: order.customerId,
      type: "ORDER_STATUS_UPDATED",
      message: `Your booking status is now ${nextStatus}.`,
      payload: { orderId: updated.id, status: nextStatus },
    });

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

    if (error instanceof OrderStatusTransitionError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to update order status", 500, error);
  }
}
