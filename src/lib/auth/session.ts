import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { verifyAuthToken } from "@/lib/auth/token";

export const AUTH_COOKIE_NAME = "fixora_access_token";
const GUEST_USER_COOKIE_NAME = "fixora_guest_user_id";

const sessionUserSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  role: true,
  cityId: true,
  city: { select: { id: true, name: true, slug: true } },
};

function generateGuestPhone() {
  return `${Math.floor(6000000000 + Math.random() * 3999999999)}`;
}

export async function getOrCreateGuestUser() {
  const cookieStore = await cookies();
  const guestUserId = cookieStore.get(GUEST_USER_COOKIE_NAME)?.value;

  if (guestUserId) {
    const existingGuest = await prisma.user.findUnique({
      where: { id: guestUserId },
      select: sessionUserSelect,
    });

    if (existingGuest) {
      return existingGuest;
    }
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const createdGuest = await prisma.user.create({
        data: {
          role: "CUSTOMER",
          name: "Guest User",
          phone: generateGuestPhone(),
        },
        select: sessionUserSelect,
      });

      cookieStore.set(GUEST_USER_COOKIE_NAME, createdGuest.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });

      return createdGuest;
    } catch {
      // Retry in the rare case of random phone collision.
    }
  }

  throw new Error("Unable to initialize guest session");
}

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
    select: sessionUserSelect,
  });
}

export async function getActiveUser() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    return sessionUser;
  }

  return getOrCreateGuestUser();
}
