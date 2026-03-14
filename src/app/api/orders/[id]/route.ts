import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: Params) {
  try {
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

    return ok({ order });
  } catch (error) {
    return fail("Unable to fetch order", 500, error);
  }
}
