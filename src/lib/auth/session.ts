import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { verifyAuthToken } from "@/lib/auth/token";

export const AUTH_COOKIE_NAME = "fixora_access_token";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      cityId: true,
      city: { select: { id: true, name: true, slug: true } },
    },
  });
}
