import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma/client";
import { signAuthToken } from "@/lib/auth/token";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { sendCredentialsEmail } from "@/lib/notifications/email";
import { enforceSameOrigin } from "@/lib/security/csrf";
import { verifyOtpCode } from "@/lib/security/otp";
import { getRateLimitKey, rateLimit } from "@/lib/security/rate-limit";
import { getPrismaConnectivityMessage } from "@/lib/utils/prisma-error";

const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  role: z.enum(["CUSTOMER", "TECHNICIAN"]),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

const MAX_ATTEMPTS = 3;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

function generateSecurePassword(length = 14): string {
  // URL-safe random password with mixed classes for temporary credential delivery.
  const raw = crypto.randomBytes(Math.ceil(length * 0.75)).toString("base64url");
  return `${raw.slice(0, Math.max(8, length - 2))}A1!`;
}

export async function POST(request: NextRequest) {
  try {
    if (!enforceSameOrigin(request)) {
      return NextResponse.json({ success: false, error: "Invalid request origin" }, { status: 403 });
    }

    const ipKey = getRateLimitKey(request);
    const rl = rateLimit({
      action: "auth.verify-otp.ip",
      key: ipKey,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts. Retry later." },
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

    const { email, otp, role, name, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  const purpose = role === "TECHNICIAN" ? "TECHNICIAN_REGISTER" : "CUSTOMER_VERIFY";

  // Find the most recent valid (unexpired, unverified) OTP for this identifier
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      phone: normalizedEmail,
      purpose,
      expiresAt: { gt: new Date() },
      verifiedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return NextResponse.json(
      { success: false, error: "OTP expired or not found. Please request a new one." },
      { status: 400 },
    );
  }

  if (otpRecord.lockedUntil && otpRecord.lockedUntil > new Date()) {
    return NextResponse.json(
      { success: false, error: "Too many failed attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((otpRecord.lockedUntil.getTime() - Date.now()) / 1000)) } },
    );
  }

  // Enforce attempt limit
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { lockedUntil: new Date(Date.now() + LOCKOUT_WINDOW_MS) },
    });
    return NextResponse.json(
      { success: false, error: "Too many failed attempts. Please request a new OTP." },
      { status: 429 },
    );
  }

  const matches = verifyOtpCode(normalizedEmail, purpose, otp, otpRecord.code);

  if (!matches) {
    const nextAttempts = otpRecord.attempts + 1;
    const shouldLock = nextAttempts >= MAX_ATTEMPTS;

    // Increment attempt counter
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: {
        attempts: { increment: 1 },
        ...(shouldLock ? { lockedUntil: new Date(Date.now() + LOCKOUT_WINDOW_MS) } : {}),
      },
    });
    const remaining = Math.max(0, MAX_ATTEMPTS - nextAttempts);
    return NextResponse.json(
      { success: false, error: `Invalid OTP. ${remaining} attempt(s) remaining.` },
      { status: 400 },
    );
  }

  // Mark OTP as verified
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { verifiedAt: new Date(), lockedUntil: null },
  });

  // Upsert user: find by email, or create with the chosen role
  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  let temporaryPassword: string | null = null;

  if (!user) {
    temporaryPassword = password ? null : generateSecurePassword();
    const chosenPassword = password ?? temporaryPassword;
    const passwordHash = await bcrypt.hash(chosenPassword!, 12);

    // New user — create with a temporary unique phone placeholder
    const tempPhone = `email_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name ?? normalizedEmail.split("@")[0],
        role,
        phone: tempPhone,
        passwordHash,
      },
    });

    if (temporaryPassword) {
      try {
        await sendCredentialsEmail(normalizedEmail, temporaryPassword);
      } catch {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[Auth] Created ${role} account for ${normalizedEmail}; temporary password: ${temporaryPassword}`);
        }
      }
    }
  } else {
    // Existing user — if role changed (e.g. CUSTOMER upgrading to TECHNICIAN), keep it
    const updates: { name?: string; passwordHash?: string } = {};

    if (name && user.name !== name) {
      updates.name = name;
    }

    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });
    }
  }

  // Link OTP record to user for audit trail
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { userId: user.id },
  });

  // Sign JWT
  const token = signAuthToken({
    userId: user.id,
    role: user.role,
    phone: user.phone,
  });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accountCreated: Boolean(temporaryPassword),
        ...(process.env.NODE_ENV !== "production" && temporaryPassword
          ? { temporaryPassword }
          : {}),
        redirectTo: user.role === "TECHNICIAN" ? "/technician" : "/customer/dashboard",
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    const connectivityMessage = getPrismaConnectivityMessage(error);
    if (connectivityMessage) {
      return NextResponse.json(
        { success: false, error: connectivityMessage },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Unable to verify OTP right now. Please try again." },
      { status: 500 },
    );
  }
}
