import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { phone?: string };
    const phone = body.phone?.trim();

    if (!phone || phone.length < 10) {
      return fail("Valid phone number is required", 422);
    }

    const recentCode = await prisma.otpCode.findFirst({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCode) {
      return fail("Please wait before requesting another OTP", 429);
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

    await prisma.otpCode.create({
      data: {
        phone,
        code: otp,
        userId: existingUser?.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return ok({
      sent: true,
      ttlSeconds: 300,
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
    });
  } catch (error) {
    return fail("Unable to send OTP", 500, error);
  }
}
