import { z } from "zod";

export const locationSchema = z.object({
  addressLine: z.string().min(5),
  landmark: z.string().optional(),
  floor: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  citySlug: z.string().min(2),
});

export const bookServiceSchema = z.object({
  customerId: z.string().min(6).optional(),
  serviceId: z.string().min(6),
  preferredTechnicianId: z.string().min(6).optional(),
  issueType: z.string().min(2),
  issueNotes: z.string().max(1000).optional(),
  preferredTime: z.string().datetime().optional(),
  location: locationSchema,
});

export const createPaymentIntentSchema = z.object({
  orderId: z.string().min(6),
  amountPaise: z.number().int().positive(),
  currency: z.string().default("inr"),
});

export const updateTechnicianLocationSchema = z.object({
  technicianId: z.string().min(6),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
