import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Params) {
  try {
    const user = await requireRole(["CUSTOMER", "TECHNICIAN", "ADMIN"]);
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        technician: { include: { user: { select: { id: true, name: true, phone: true, email: true } } } },
        service: true,
        payment: true,
        location: true,
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

    const amountPaise = order.finalAmountPaise ?? order.estimatedAmountPaise;

    return ok({
      invoice: {
        invoiceNumber: `INV-${order.id.slice(0, 8).toUpperCase()}`,
        issuedAt: new Date().toISOString(),
        orderId: order.id,
        service: {
          name: order.service.name,
          category: order.service.category,
        },
        customer: order.customer,
        technician: order.technician?.user ?? null,
        location: order.location,
        payment: order.payment,
        amountPaise,
        currency: order.payment?.currency ?? "inr",
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to generate invoice", 500, error);
  }
}
