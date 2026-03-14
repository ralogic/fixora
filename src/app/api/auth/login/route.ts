import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { signAuthToken } from "@/lib/auth/token";
import { enforceSameOrigin } from "@/lib/security/csrf";
import { getRateLimitKey, rateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"]).optional(),
});

function getRedirectPath(role: "CUSTOMER" | "TECHNICIAN" | "ADMIN"): string {
  if (role === "TECHNICIAN") {
    return "/technician";
  }

  if (role === "ADMIN") {
    return "/admin";
  }

  return "/customer/dashboard";
}

export async function POST(request: NextRequest) {
  if (!enforceSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Invalid request origin" }, { status: 403 });
  }

  const ipKey = getRateLimitKey(request);
  const rl = rateLimit({
    action: "auth.login.ip",
    key: ipKey,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many login attempts. Retry later." },
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

  const { email, password, role } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 },
    );
  }

  if (role && user.role !== role) {
    return NextResponse.json(
      { success: false, error: `This account is not registered as ${role}` },
      { status: 403 },
    );
  }

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
      redirectTo: getRedirectPath(user.role),
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
