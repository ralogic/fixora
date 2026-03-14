import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: NextRequest, context: Params) {
  try {
    const user = await requireRole("CUSTOMER");

    const { id } = await context.params;
    const address = await prisma.address.findUnique({ where: { id } });

    if (!address || address.userId !== user.id) {
      return fail("Address not found", 404);
    }

    await prisma.address.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Unable to delete address", 500, error);
  }
}
