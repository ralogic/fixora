import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET || "dev-jwt-secret-change-me");

type Role = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

export type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
};

export async function signAccessToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as SessionPayload;
}
