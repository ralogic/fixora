import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole("CUSTOMER");

    const orders = await prisma.order.findMany({
      where: { customerId: user.id },
      include: {
        service: true,
        technician: {
          include: {
            user: true,
          },
        },
        location: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return ok({ orders });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Unable to fetch orders", 500, error);
  }
}
