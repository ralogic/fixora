import { prisma } from "@/lib/prisma/client";

export async function resolveZoneByCoordinates(cityId: string, lat: number, lng: number) {
  const zones = await prisma.serviceZone.findMany({ where: { cityId, isActive: true } });

  let nearest: { id: string; distance: number } | null = null;

  for (const zone of zones) {
    const center = parseCenter(zone.polygonJson);
    if (!center) {
      continue;
    }

    const distance = haversine(lat, lng, center[0], center[1]);
    if (!nearest || distance < nearest.distance) {
      nearest = { id: zone.id, distance };
    }
  }

  if (!nearest) {
    return { zoneId: null, confidence: "red" as const };
  }

  if (nearest.distance <= 3) {
    return { zoneId: nearest.id, confidence: "green" as const };
  }

  if (nearest.distance <= 8) {
    return { zoneId: nearest.id, confidence: "amber" as const };
  }

  return { zoneId: null, confidence: "red" as const };
}

function parseCenter(polygonJson: unknown): [number, number] | null {
  if (
    polygonJson &&
    typeof polygonJson === "object" &&
    "center" in polygonJson &&
    Array.isArray((polygonJson as { center?: unknown[] }).center)
  ) {
    const center = (polygonJson as { center: unknown[] }).center;
    const lat = Number(center[0]);
    const lng = Number(center[1]);

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return [lat, lng];
    }
  }

  return null;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function toRadians(v: number) {
  return (v * Math.PI) / 180;
}
