import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

const patchSchema = z.object({
  paymentId: z.string().min(6),
  status: z.enum(["PENDING", "REQUIRES_ACTION", "SUCCEEDED", "FAILED", "REFUNDED"]),
  refundAmountPaise: z.number().int().min(0).optional(),
  note: z.string().max(300).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const rows = await prisma.payment.findMany({
      where: status ? { status: status as never } : {},
      include: {
        order: {
          select: {
            id: true,
            status: true,
            cityId: true,
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            technician: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return ok({ payments: rows });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to fetch payments", 500, error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole("ADMIN");

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid payload", 422, parsed.error.flatten());
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parsed.data.paymentId },
      include: { order: true },
    });

    if (!payment) {
      return fail("Payment not found", 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: parsed.data.status,
          refundAmountPaise:
            parsed.data.status === "REFUNDED"
              ? parsed.data.refundAmountPaise ?? payment.amountPaise
              : payment.refundAmountPaise,
          paidAt: parsed.data.status === "SUCCEEDED" ? payment.paidAt ?? new Date() : payment.paidAt,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: parsed.data.status,
          events: {
            create: {
              type: "payment.adjusted.by_admin",
              payloadJson: {
                adminUserId: admin.id,
                paymentId: payment.id,
                status: parsed.data.status,
                refundAmountPaise: parsed.data.refundAmountPaise ?? null,
                note: parsed.data.note ?? null,
              },
            },
          },
        },
      });

      return updatedPayment;
    });

    return ok({ payment: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to update payment", 500, error);
  }
}
