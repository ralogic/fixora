import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: Params) {
  try {
    const user = await requireRole(["CUSTOMER", "TECHNICIAN", "ADMIN"]);
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        location: true,
        payment: true,
        technician: {
          include: {
            user: true,
          },
        },
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return fail("Order not found", 404);
    }

    if (user.role === "CUSTOMER" && order.customerId !== user.id) {
      return fail("Forbidden", 403);
    }

    if (user.role === "TECHNICIAN" && order.technicianId !== user.id) {
      return fail("Forbidden", 403);
    }

    return ok({ order });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Unable to fetch order", 500, error);
  }
}
