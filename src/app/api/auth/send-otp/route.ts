import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { enforceSameOrigin } from "@/lib/security/csrf";
import { generateOtpCode, hashOtpCode } from "@/lib/security/otp";
import { getRateLimitKey, rateLimit } from "@/lib/security/rate-limit";
import { getPrismaConnectivityMessage } from "@/lib/utils/prisma-error";

const OTP_TTL_MS = 5 * 60 * 1000;

const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["CUSTOMER", "TECHNICIAN"]),
});

export async function POST(request: NextRequest) {
  try {
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

    // Console delivery mode: print OTP directly in terminal for testing.
    console.log(`[OTP] ${normalizedEmail} -> ${code}`);

    return NextResponse.json({
      success: true,
      message: "OTP generated. Check server terminal logs.",
    });
  } catch (error) {
    const connectivityMessage = getPrismaConnectivityMessage(error);
    if (connectivityMessage) {
      return NextResponse.json(
        { success: false, error: connectivityMessage },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Unable to send OTP right now. Please try again." },
      { status: 500 },
    );
  }
}
