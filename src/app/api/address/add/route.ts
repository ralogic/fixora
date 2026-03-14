import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { resolveZoneByCoordinates } from "@/lib/utils/zones";
import { fail, ok } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Unauthorized", 401);
    }

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

    if (!body.addressLine || typeof body.lat !== "number" || typeof body.lng !== "number") {
      return fail("addressLine, lat, lng are required", 422);
    }

    const city = await prisma.city.findUnique({
      where: { slug: body.citySlug ?? "jaipur" },
      select: { id: true, slug: true },
    });

    if (!city) {
      return fail("City not found", 404);
    }

    const zoneResolution = await resolveZoneByCoordinates(city.id, body.lat, body.lng);
    const label = (body.label ?? "HOME").toUpperCase();
    const mappedLabel = label === "OFFICE" || label === "OTHER" ? label : "HOME";

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        cityId: city.id,
        zoneId: body.zoneId ?? zoneResolution.zoneId,
        label: mappedLabel,
        addressLine: body.addressLine,
        landmark: body.landmark,
        floor: body.floor,
        lat: body.lat,
        lng: body.lng,
      },
      include: {
        city: {
          select: { id: true, name: true, slug: true },
        },
        zone: {
          select: { id: true, name: true },
        },
      },
    });

    return ok({
      address,
      zoneConfidence: zoneResolution.confidence,
    });
  } catch (error) {
    return fail("Unable to save address", 500, error);
  }
}
