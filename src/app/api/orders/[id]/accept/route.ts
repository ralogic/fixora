import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: Params) {
  try {
    const { id } = await context.params;
    const { technicianId } = (await request.json()) as { technicianId?: string };

    if (!technicianId) {
      return fail("technicianId is required", 422);
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return fail("Order not found", 404);
    }

    if (order.technicianId !== technicianId) {
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
            payloadJson: { technicianId },
          },
        },
      },
    });

    return ok({ orderId: updated.id, status: updated.status });
  } catch (error) {
    return fail("Unable to accept order", 500, error);
  }
}
