export type FixoraRole = "customer" | "technician" | "admin";

export type BookingRequest = {
  customerId: string;
  serviceId: string;
  issueType: string;
  issueNotes?: string;
  preferredTime?: string;
  location: {
    addressLine: string;
    landmark?: string;
    floor?: string;
    lat: number;
    lng: number;
    citySlug: string;
  };
};

export type MatchingTechnician = {
  technicianId: string;
  name: string;
  distanceKm: number;
  etaMinutes: number;
  avgRating: number;
  acceptanceRate: number;
  activeJobs: number;
  matchingScore: number;
};

export type OrderTimelineStatus =
  | "PENDING"
  | "PENDING_ASSIGNMENT"
  | "ASSIGNED"
  | "ON_THE_WAY"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";
