import { z } from "zod";

export const bookingCreateSchema = z.object({
  service: z.string().min(2),
  technicianId: z.string().min(1),
  date: z.string().datetime(),
  price: z.number().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressLine: z.string().min(5),
});

export const bookingStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "ACCEPTED",
    "ON_THE_WAY",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELED",
    "REJECTED",
  ]),
});
