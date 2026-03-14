import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["CUSTOMER", "TECHNICIAN", "ADMIN"]);

    const baseInclude = {
      service: true,
      technician: {
        include: {
          user: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      location: true,
      rating: true,
    } as const;

    if (user.role === "CUSTOMER") {
      const orders = await prisma.order.findMany({
        where: { customerId: user.id },
        include: baseInclude,
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return ok({ orders, scope: "customer" as const });
    }

    if (user.role === "TECHNICIAN") {
      const orders = await prisma.order.findMany({
        where: { technicianId: user.id },
        include: baseInclude,
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return ok({ orders, scope: "technician" as const });
    }

    const orders = await prisma.order.findMany({
      include: baseInclude,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok({ orders, scope: "admin" as const });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Unable to fetch orders", 500, error);
  }
}
