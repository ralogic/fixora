import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";
import { enforceSameOrigin } from "@/lib/security/csrf";

const schema = z.object({
  isOnline: z.boolean(),
});

export async function GET() {
  try {
    const user = await requireRole("TECHNICIAN");

    const technician = await prisma.technician.findUnique({
      where: { id: user.id },
      select: { id: true, isOnline: true, currentLat: true, currentLng: true, primaryCityId: true },
    });

    if (!technician) {
      return fail("Technician profile not found", 404);
    }

    return ok({ technician });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to fetch technician status", 500, error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!enforceSameOrigin(request)) {
      return fail("Invalid request origin", 403);
    }

    const user = await requireRole("TECHNICIAN");
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid payload", 422, parsed.error.flatten());
    }

    const technician = await prisma.technician.update({
      where: { id: user.id },
      data: { isOnline: parsed.data.isOnline },
      select: { id: true, isOnline: true, primaryCityId: true },
    });

    return ok({ technician });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to update technician status", 500, error);
  }
}
