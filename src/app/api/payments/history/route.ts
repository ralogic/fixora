import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

export async function GET() {
  try {
    const user = await requireRole("CUSTOMER");

    const rows = await prisma.payment.findMany({
      where: {
        order: {
          customerId: user.id,
        },
      },
      include: {
        order: {
          select: {
            id: true,
            service: {
              select: { name: true, category: true },
            },
            createdAt: true,
            finalAmountPaise: true,
            estimatedAmountPaise: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok({ payments: rows });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to fetch payment history", 500, error);
  }
}
