import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { sendPasswordResetEmail } from "@/lib/notifications/email";
import { enforceSameOrigin } from "@/lib/security/csrf";
import { generatePasswordResetToken, hashPasswordResetToken } from "@/lib/security/password-reset";
import { getRateLimitKey, rateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  if (!enforceSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid request origin" }, { status: 403 });
  }

  const ipKey = getRateLimitKey(request);
  const rl = rateLimit({ action: "auth.forgot-password.ip", key: ipKey, limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Retry later." },
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

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid account enumeration.
  if (!user?.passwordHash) {
    return NextResponse.json({ success: true, message: "If the account exists, reset instructions were sent." });
  }

  const token = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Unable to send password reset email" },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ success: true, message: "If the account exists, reset instructions were sent." });
}
