import crypto from "crypto";

function getPepper(): string {
  return process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "fixora-reset-dev-secret";
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(`${getPepper()}:${token}`).digest("hex");
}
