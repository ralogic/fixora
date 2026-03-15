import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { hashOtpCode, generateOtpCode } from "@/lib/auth/otp";
import { sendOtpSchema } from "@/lib/validation/auth";
import { fail, ok } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const limited = checkRateLimit(`send-otp:${ip}`, 8, 10 * 60 * 1000);
  if (!limited.allowed) return fail("Too many OTP requests", 429);

  const body = await req.json().catch(() => null);
  const parsed = sendOtpSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request", 400, parsed.error.flatten());

  const code = generateOtpCode();
  const codeHash = await hashOtpCode(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      purpose: parsed.data.purpose,
      codeHash,
      expiresAt,
    },
  });

  // Replace with provider integration in production.
  console.info(`[OTP] ${parsed.data.email}: ${code}`);

  return ok({ message: "OTP sent successfully" });
}
