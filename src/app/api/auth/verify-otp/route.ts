import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { signAuthToken } from "@/lib/auth/token";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { fail } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { phone?: string; otp?: string; name?: string };
    const phone = body.phone?.trim();
    const otp = body.otp?.trim();

    if (!phone || !otp) {
      return fail("phone and otp are required", 422);
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        verifiedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord || otpRecord.expiresAt.getTime() < Date.now()) {
      return fail("OTP expired. Please request a new OTP", 401);
    }

    if (otpRecord.attempts >= 5) {
      return fail("Too many attempts. Request a new OTP", 429);
    }

    if (otpRecord.code !== otp) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return fail("Invalid OTP", 401);
    }

    const city = await prisma.city.findFirst({
      where: { slug: "jaipur" },
      select: { id: true },
    });

    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        name: body.name?.trim() || undefined,
      },
      create: {
        role: "CUSTOMER",
        name: body.name?.trim() || "Fixora Customer",
        phone,
        cityId: city?.id,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
      },
    });

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: {
        verifiedAt: new Date(),
        userId: user.id,
      },
    });

    const token = signAuthToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user,
        token,
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
  } catch (error) {
    return fail("Unable to verify OTP", 500, error);
  }
}
