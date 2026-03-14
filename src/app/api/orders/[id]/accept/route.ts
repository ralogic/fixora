import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";
import { createNotification } from "@/server/modules/notifications/service";
import { enforceSameOrigin } from "@/lib/security/csrf";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: Params) {
  try {
    if (!enforceSameOrigin(request)) {
      return fail("Invalid request origin", 403);
    }

    const user = await requireRole("TECHNICIAN");
    const { id } = await context.params;
    await request.json().catch(() => ({}));

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return fail("Order not found", 404);
    }

    if (order.technicianId !== user.id) {
      return fail("Technician is not assigned to this order", 403);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "ASSIGNED",
        assignedAt: new Date(),
        events: {
          create: {
            type: "dispatch.offer.accepted",
            payloadJson: { technicianId: user.id },
          },
        },
      },
    });

    await createNotification({
      userId: order.customerId,
      type: "TECHNICIAN_ACCEPTED",
      message: "Your technician accepted the job and is preparing to travel.",
      payload: { orderId: updated.id, technicianId: user.id },
    });

    return ok({ orderId: updated.id, status: updated.status });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Unable to accept order", 500, error);
  }
}
