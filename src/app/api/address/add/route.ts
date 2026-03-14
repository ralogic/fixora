import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { resolveZoneByCoordinates } from "@/lib/utils/zones";
import { getPrismaConnectivityMessage } from "@/lib/utils/prisma-error";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const connectivityMessage = getPrismaConnectivityMessage(error);
      if (!connectivityMessage || attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("CUSTOMER");

    const body = (await request.json()) as {
      label?: string;
      addressLine?: string;
      landmark?: string;
      floor?: string;
      lat?: number;
      lng?: number;
      citySlug?: string;
      zoneId?: string;
    };

    const addressLine = typeof body.addressLine === "string" ? body.addressLine.trim() : "";
    const lat = typeof body.lat === "number" ? body.lat : null;
    const lng = typeof body.lng === "number" ? body.lng : null;

    if (!addressLine || lat === null || lng === null) {
      return fail("addressLine, lat, lng are required", 422);
    }

    const city = await withRetry(() =>
      prisma.city.findUnique({
        where: { slug: body.citySlug ?? "jaipur" },
        select: { id: true, slug: true },
      }),
    );

    if (!city) {
      return fail("City not found", 404);
    }

    const zoneResolution = await resolveZoneByCoordinates(city.id, lat, lng);
    const label = (body.label ?? "HOME").toUpperCase();
    const mappedLabel = label === "OFFICE" || label === "OTHER" ? label : "HOME";

    const address = await withRetry(() =>
      prisma.address.create({
        data: {
          userId: user.id,
          cityId: city.id,
          zoneId: body.zoneId ?? zoneResolution.zoneId,
          label: mappedLabel,
          addressLine,
          landmark: body.landmark,
          floor: body.floor,
          lat,
          lng,
        },
        include: {
          city: {
            select: { id: true, name: true, slug: true },
          },
          zone: {
            select: { id: true, name: true },
          },
        },
      }),
    );

    return ok({
      address,
      zoneConfidence: zoneResolution.confidence,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    const connectivityMessage = getPrismaConnectivityMessage(error);
    if (connectivityMessage) {
      return fail(connectivityMessage, 503);
    }

    return fail("Unable to save address", 500, error);
  }
}
