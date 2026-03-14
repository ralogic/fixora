import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

const createSchema = z.object({
  orderId: z.string().min(6),
  reason: z.string().min(5).max(500),
});

const resolveSchema = z.object({
  disputeId: z.string().min(6),
  status: z.enum(["IN_REVIEW", "RESOLVED", "CLOSED"]),
  resolution: z.string().max(1000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["CUSTOMER", "ADMIN"]);
    const rows = await prisma.dispute.findMany({
      where: user.role === "ADMIN" ? {} : { raisedByUserId: user.id },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            service: { select: { name: true } },
          },
        },
        raisedBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok({ disputes: rows });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Unable to fetch disputes", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["CUSTOMER", "ADMIN"]);
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid payload", 422, parsed.error.flatten());
    }

    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!order) {
      return fail("Order not found", 404);
    }

    if (user.role === "CUSTOMER" && order.customerId !== user.id) {
      return fail("Forbidden", 403);
    }

    const dispute = await prisma.dispute.create({
      data: {
        orderId: parsed.data.orderId,
        raisedByUserId: user.id,
        reason: parsed.data.reason,
      },
    });

    return ok({ dispute }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Unable to create dispute", 500, error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const body = await request.json();
    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid payload", 422, parsed.error.flatten());
    }

    const dispute = await prisma.dispute.update({
      where: { id: parsed.data.disputeId },
      data: {
        status: parsed.data.status,
        resolution: parsed.data.resolution ?? null,
      },
    });

    return ok({ dispute });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Unable to update dispute", 500, error);
  }
}
