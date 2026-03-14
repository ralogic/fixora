type Coordinates = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number): number => (value * Math.PI) / 180;

export function calculateDistanceKm(origin: Coordinates, destination: Coordinates): number {
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) *
      Math.cos(toRadians(destination.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

export function estimateEtaMinutes(distanceKm: number, cityTrafficFactor = 1.15): number {
  const avgCitySpeedKmPerHour = 24;
  const hours = (distanceKm / avgCitySpeedKmPerHour) * cityTrafficFactor;
  return Math.max(5, Math.ceil(hours * 60));
}

export function calculateMatchingScore(input: {
  distanceKm: number;
  acceptanceRate: number;
  avgRating: number;
  activeJobs: number;
}): number {
  const distanceWeight = 0.55;
  const acceptanceWeight = 0.2;
  const ratingWeight = 0.15;
  const workloadWeight = 0.1;

  const distanceComponent = input.distanceKm;
  const acceptancePenalty = 1 - input.acceptanceRate;
  const ratingBoost = 5 - input.avgRating;
  const workloadPenalty = input.activeJobs;

  return Number(
    (
      distanceWeight * distanceComponent +
      acceptanceWeight * acceptancePenalty +
      ratingWeight * ratingBoost +
      workloadWeight * workloadPenalty
    ).toFixed(4),
  );
}
