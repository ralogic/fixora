import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const role = request.nextUrl.searchParams.get("role") ?? undefined;
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: role as never } : {}),
      },
      select: {
        id: true,
        role: true,
        name: true,
        phone: true,
        email: true,
        cityId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return ok({ users });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to fetch users", 500, error);
  }
}
