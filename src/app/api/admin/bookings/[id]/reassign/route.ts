import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";
import { createNotification } from "@/server/modules/notifications/service";
import { writeAuditLog } from "@/server/modules/admin/audit";
import { emitDispatchOffer, emitOrderStatusUpdate } from "@/lib/socket/realtime";

const bodySchema = z.object({
  technicianId: z.string().min(6),
  reason: z.string().max(300).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Params) {
  try {
    const admin = await requireRole("ADMIN");
    const { id } = await context.params;

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid payload", 422, parsed.error.flatten());
    }

    const { technicianId, reason } = parsed.data;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return fail("Order not found", 404);
    }

    const technician = await prisma.technician.findUnique({ where: { id: technicianId } });
    if (!technician || technician.verificationStatus !== "VERIFIED") {
      return fail("Technician not eligible for assignment", 422);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        technicianId,
        status: "ASSIGNED",
        assignedAt: new Date(),
        events: {
          create: {
            type: "dispatch.reassigned.by_admin",
            payloadJson: {
              previousTechnicianId: order.technicianId,
              nextTechnicianId: technicianId,
              reason: reason ?? null,
              adminUserId: admin.id,
            },
          },
        },
      },
    });

    await Promise.all([
      createNotification({
        userId: updated.customerId,
        type: "TECHNICIAN_REASSIGNED",
        message: "Your booking has been reassigned to a different technician.",
        payload: { orderId: updated.id, technicianId },
      }),
      createNotification({
        userId: technicianId,
        type: "NEW_JOB_REQUEST",
        message: "A new job was assigned to you by admin dispatch.",
        payload: { orderId: updated.id },
      }),
    ]);

    await Promise.all([
      emitDispatchOffer({
        orderId: updated.id,
        technicianId,
        serviceId: updated.serviceId,
        cityId: updated.cityId,
        etaMinutes: updated.estimatedEtaMinutes,
      }),
      emitOrderStatusUpdate({
        orderId: updated.id,
        status: updated.status,
        cityId: updated.cityId,
        technicianId: updated.technicianId,
      }),
    ]);

    await writeAuditLog({
      actorUserId: admin.id,
      action: "ORDER_REASSIGNED",
      resource: "order",
      resourceId: updated.id,
      details: {
        previousTechnicianId: order.technicianId,
        nextTechnicianId: technicianId,
        reason: reason ?? null,
      },
    });

    return ok({ orderId: updated.id, status: updated.status, technicianId: updated.technicianId });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to reassign order", 500, error);
  }
}
