import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";
import { enforceSameOrigin } from "@/lib/security/csrf";
import { emitTechnicianLocationUpdate } from "@/lib/socket/realtime";

const schema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  orderId: z.string().min(6).optional(),
});

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
      data: {
        currentLat: parsed.data.lat,
        currentLng: parsed.data.lng,
        lastLocationAt: new Date(),
      },
      select: {
        id: true,
        currentLat: true,
        currentLng: true,
        primaryCityId: true,
      },
    });

    await emitTechnicianLocationUpdate({
      technicianId: user.id,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      orderId: parsed.data.orderId ?? null,
      cityId: technician.primaryCityId,
    });

    return ok({
      technician: {
        id: technician.id,
        currentLat: Number(technician.currentLat),
        currentLng: Number(technician.currentLng),
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to update technician location", 500, error);
  }
}
