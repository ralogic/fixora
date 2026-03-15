import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.email(),
  purpose: z.enum(["LOGIN", "SIGNUP", "PASSWORD_RESET", "TECHNICIAN_ONBOARD"]),
});

export const verifyOtpSchema = z.object({
  email: z.email(),
  purpose: z.enum(["LOGIN", "SIGNUP", "PASSWORD_RESET", "TECHNICIAN_ONBOARD"]),
  code: z.string().length(6),
  name: z.string().min(2).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"]).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
