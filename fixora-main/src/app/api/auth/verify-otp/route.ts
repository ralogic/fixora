import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyOtpCode } from "@/lib/auth/otp";
import { verifyOtpSchema } from "@/lib/validation/auth";
import { fail } from "@/lib/utils/response";
import { sanitizeString } from "@/lib/utils/sanitize";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request", 400, parsed.error.flatten());

  const email = parsed.data.email.toLowerCase();

  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      purpose: parsed.data.purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return fail("OTP expired or not found", 400);

  const valid = await verifyOtpCode(parsed.data.code, otp.codeHash);
  if (!valid) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return fail("Invalid OTP", 400);
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user && parsed.data.password && parsed.data.name) {
    user = await prisma.user.create({
      data: {
        name: sanitizeString(parsed.data.name),
        email,
        passwordHash: await hashPassword(parsed.data.password),
        role: parsed.data.role ?? "CUSTOMER",
      },
    });
  }

  if (!user) return fail("User does not exist. Complete signup fields.", 400);

  const token = await signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const response = NextResponse.json({ ok: true, data: { token, user } });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
