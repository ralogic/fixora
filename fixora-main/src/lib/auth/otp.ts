import bcrypt from "bcryptjs";

export function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function hashOtpCode(code: string) {
  return bcrypt.hash(code, 10);
}

export async function verifyOtpCode(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}
