import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

export async function GET() {
  try {
    const user = await requireRole(["CUSTOMER", "TECHNICIAN", "ADMIN"]);

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok({ notifications });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to fetch notifications", 500, error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(["CUSTOMER", "TECHNICIAN", "ADMIN"]);
    const body = (await request.json().catch(() => ({}))) as { ids?: string[] };

    const ids = Array.isArray(body.ids) ? body.ids : [];
    if (!ids.length) {
      return fail("ids are required", 422);
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    return ok({ updated: ids.length });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to update notifications", 500, error);
  }
}
