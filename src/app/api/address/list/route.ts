import { prisma } from "@/lib/prisma/client";
import { getPrismaConnectivityMessage } from "@/lib/utils/prisma-error";
import { fail, ok } from "@/lib/utils/response";
import { getActiveUser } from "@/lib/auth/session";
import { PrismaFastFailError, withPrismaFailFast } from "@/lib/utils/prisma-error";

export async function GET() {
  try {
    const user = await withPrismaFailFast(() => getActiveUser(), { timeoutMs: 2000, backoffMs: 20000 });

    const addresses = await withPrismaFailFast(
      () =>
        prisma.address.findMany({
          where: { userId: user.id },
          include: {
            city: { select: { id: true, name: true, slug: true } },
            zone: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      { timeoutMs: 2000, backoffMs: 20000 },
    );

    return ok({ addresses });
  } catch (error) {
    const connectivityMessage = getPrismaConnectivityMessage(error);
    if (connectivityMessage || error instanceof PrismaFastFailError) {
      return ok({ addresses: [], degraded: true });
    }

    return fail("Unable to load addresses", 500, error);
  }
}
