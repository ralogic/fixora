import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const cityId = request.nextUrl.searchParams.get("cityId") ?? undefined;

    const rows = await prisma.order.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(cityId ? { cityId } : {}),
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        technician: { include: { user: { select: { id: true, name: true, phone: true } } } },
        service: true,
        location: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return ok({ bookings: rows });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to fetch bookings", 500, error);
  }
}
