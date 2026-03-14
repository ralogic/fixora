import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId");
    if (!customerId) {
      return fail("customerId is required", 422);
    }

    const orders = await prisma.order.findMany({
      where: { customerId },
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
    return fail("Unable to fetch orders", 500, error);
  }
}
