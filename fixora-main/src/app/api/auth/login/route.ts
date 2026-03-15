import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { fail } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request", 400, parsed.error.flatten());

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user?.passwordHash) return fail("Invalid credentials", 401);

  const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!isValid) return fail("Invalid credentials", 401);
  if (user.isSuspended) return fail("Account suspended", 403);

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
