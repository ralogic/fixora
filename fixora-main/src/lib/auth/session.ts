import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyAccessToken, type SessionPayload } from "@/lib/auth/jwt";

const COOKIE_NAME = "fixora_token";

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const token = bearer || req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
