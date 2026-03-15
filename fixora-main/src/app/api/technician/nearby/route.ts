import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/response";

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service");
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!service || Number.isNaN(lat) || Number.isNaN(lng)) {
    return fail("service, lat, lng are required", 400);
  }

  const technicians = await prisma.technician.findMany({
    where: {
      verified: true,
      online: true,
      category: { contains: service, mode: "insensitive" },
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
      user: { select: { id: true, name: true } },
    },
    take: 100,
  });

  const nearby = technicians
    .map((tech) => ({
      ...tech,
      distanceKm: haversineDistanceKm(lat, lng, tech.latitude!, tech.longitude!),
    }))
    .filter((tech) => tech.distanceKm <= tech.serviceAreaKm)
    .sort((a, b) => a.distanceKm - b.distanceKm || b.rating - a.rating)
    .slice(0, 20);

  return ok(nearby);
}
