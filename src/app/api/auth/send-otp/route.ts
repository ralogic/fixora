import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { sendOtpEmail } from "@/lib/notifications/email";
import { enforceSameOrigin } from "@/lib/security/csrf";
import { generateOtpCode, hashOtpCode } from "@/lib/security/otp";
import { getRateLimitKey, rateLimit } from "@/lib/security/rate-limit";

const OTP_TTL_MS = 5 * 60 * 1000;

const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["CUSTOMER", "TECHNICIAN"]),
});

export async function POST(request: NextRequest) {
  if (!enforceSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid request origin" }, { status: 403 });
  }

  const ipKey = getRateLimitKey(request);
  const rl = rateLimit({
    action: "auth.send-otp.ip",
    key: ipKey,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please retry later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { email, role } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  const purpose = role === "TECHNICIAN" ? "TECHNICIAN_REGISTER" : "CUSTOMER_VERIFY";

  // Rate-limit: max 3 OTPs per email in a 10-minute window
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await prisma.otpCode.count({
    where: {
      phone: normalizedEmail,
      purpose,
      createdAt: { gte: tenMinutesAgo },
    },
  });

  if (recentCount >= 3) {
    return NextResponse.json(
      { success: false, error: "Too many OTP requests. Please wait a few minutes." },
      { status: 429 },
    );
  }

  const code = generateOtpCode();
  const codeHash = hashOtpCode(normalizedEmail, purpose, code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpCode.create({
    data: {
      phone: normalizedEmail,
      purpose,
      code: codeHash,
      expiresAt,
      attempts: 0,
      lockedUntil: null,
    },
  });

  try {
    await sendOtpEmail(normalizedEmail, code);
  } catch (error) {
    // Keep local flow unblocked when email provider is not configured.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[OTP] Email provider unavailable, falling back to console output");
      console.log(`[OTP] ${normalizedEmail} -> ${code}`);
    } else {
      return NextResponse.json(
        { success: false, error: "Unable to send OTP email right now. Please try again." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ success: true, message: "OTP sent successfully" });
}
