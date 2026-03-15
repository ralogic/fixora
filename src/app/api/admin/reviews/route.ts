import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

const deleteSchema = z.object({
  ratingId: z.string().min(6),
  reason: z.string().max(300).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const minScore = request.nextUrl.searchParams.get("minScore");
    const rows = await prisma.rating.findMany({
      where: minScore ? { score: { gte: Number(minScore) } } : {},
      include: {
        order: {
          select: {
            id: true,
            status: true,
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
        customer: {
          select: { id: true, name: true, phone: true },
        },
        technician: {
          include: {
            user: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    return ok({ reviews: rows });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to fetch reviews", 500, error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid payload", 422, parsed.error.flatten());
    }

    const rating = await prisma.rating.findUnique({ where: { id: parsed.data.ratingId } });
    if (!rating) {
      return fail("Review not found", 404);
    }

    await prisma.$transaction([
      prisma.orderEvent.create({
        data: {
          orderId: rating.orderId,
          type: "review.removed.by_admin",
          payloadJson: {
            ratingId: rating.id,
            reason: parsed.data.reason ?? null,
          },
        },
      }),
      prisma.rating.delete({ where: { id: rating.id } }),
    ]);

    return ok({ removed: true, ratingId: rating.id });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to remove review", 500, error);
  }
}
