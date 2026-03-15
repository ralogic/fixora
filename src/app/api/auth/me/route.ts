import { getActiveUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import {
  getPrismaConnectivityMessage,
  PrismaFastFailError,
  withPrismaFailFast,
} from "@/lib/utils/prisma-error";

const TEST_VERIFIED_EMAILS = new Set([
  "admin@fixora.com",
  "rohit@fixora.in",
  "rahul@fixora.in",
  "customer@fixora.com",
]);

export async function GET() {
  try {
    const user = await withPrismaFailFast(() => getActiveUser(), { timeoutMs: 2000, backoffMs: 20000 });

    let emailVerified = false;
    const normalizedEmail = user.email?.toLowerCase().trim();

    if (normalizedEmail) {
      if (TEST_VERIFIED_EMAILS.has(normalizedEmail)) {
        emailVerified = true;
      } else {
        const verifiedOtp = await withPrismaFailFast(
          () =>
            prisma.otpCode.findFirst({
              where: {
                phone: normalizedEmail,
                verifiedAt: { not: null },
                purpose: { in: ["CUSTOMER_VERIFY", "TECHNICIAN_REGISTER"] },
              },
              select: { id: true },
              orderBy: { verifiedAt: "desc" },
            }),
          { timeoutMs: 2000, backoffMs: 20000 },
        );

        emailVerified = Boolean(verifiedOtp);
      }
    }

    return ok({ user: { ...user, emailVerified } });
  } catch (error) {
    const connectivityMessage = getPrismaConnectivityMessage(error);
    if (connectivityMessage || error instanceof PrismaFastFailError) {
      return ok({
        user: {
          id: "guest-local",
          name: "Guest User",
          phone: "",
          email: null,
          emailVerified: false,
          role: "CUSTOMER",
          cityId: null,
          city: null,
        },
        degraded: true,
      });
    }

    return fail("Unable to fetch session", 500, error);
  }
}
