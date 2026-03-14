export type FixoraRole = "customer" | "technician" | "admin";

export type BookingRequest = {
  customerId: string;
  serviceId: string;
  preferredTechnicianId?: string;
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
  serviceCategory?: string;
  experienceYears?: number;
  completedJobs?: number;
  isOnline?: boolean;
  profilePhotoUrl?: string | null;
  skills?: string[];
  workType?: string;
  distanceKm: number;
  etaMinutes: number;
  avgRating: number;
  acceptanceRate: number;
  activeJobs: number;
  matchingScore: number;
};

export type BookingCreationResult = {
  orderId: string;
  status: OrderTimelineStatus;
  estimatedEtaMinutes: number | null;
  estimatedAmountPaise: number;
  technician: {
    id: string;
    name: string;
    avgRating: number;
  } | null;
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
