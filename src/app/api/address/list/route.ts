import { prisma } from "@/lib/prisma/client";
import { getPrismaConnectivityMessage } from "@/lib/utils/prisma-error";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

export async function GET() {
  try {
    const user = await requireRole("CUSTOMER");

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      include: {
        city: { select: { id: true, name: true, slug: true } },
        zone: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ addresses });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    const connectivityMessage = getPrismaConnectivityMessage(error);
    if (connectivityMessage) {
      return fail(connectivityMessage, 503);
    }

    return fail("Unable to load addresses", 500, error);
  }
}
