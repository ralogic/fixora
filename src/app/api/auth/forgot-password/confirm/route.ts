import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { enforceSameOrigin } from "@/lib/security/csrf";
import { hashPasswordResetToken } from "@/lib/security/password-reset";
import { getRateLimitKey, rateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  token: z.string().min(20, "Invalid token"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  if (!enforceSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid request origin" }, { status: 403 });
  }

  const ipKey = getRateLimitKey(request);
  const rl = rateLimit({ action: "auth.forgot-password.confirm.ip", key: ipKey, limit: 10, windowMs: 10 * 60 * 1000 });
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

  const { token, newPassword } = parsed.data;
  const tokenHash = hashPasswordResetToken(token);

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt <= new Date()) {
    return NextResponse.json({ success: false, error: "Reset token is invalid or expired" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true, message: "Password updated successfully" });
}
