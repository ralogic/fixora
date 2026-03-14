export type RankedTechnicianCandidate = {
  technicianId: string;
  name: string;
  serviceCategory: string;
  experienceYears: number;
  completedJobs: number;
  isOnline: boolean;
  profilePhotoUrl: string | null;
  skills: string[];
  workType: string;
  distanceKm: number;
  etaMinutes: number;
  avgRating: number;
  acceptanceRate: number;
  activeJobs: number;
  matchingScore: number;
};

export type RankedTechnicianSearchInput = {
  serviceId: string;
  lat: number;
  lng: number;
  cityId?: string;
  citySlug?: string;
  limit?: number;
};

export type RankedTechnicianSearchResult = {
  cityId: string;
  citySlug: string;
  results: RankedTechnicianCandidate[];
};
