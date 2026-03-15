import { z } from "zod";

export const technicianOnboardSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  category: z.string().min(2),
  experience: z.number().int().min(0),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  idProofUrl: z.url().optional(),
  profilePhotoUrl: z.url().optional(),
});
