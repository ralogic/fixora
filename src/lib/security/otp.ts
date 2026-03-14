import crypto from "crypto";

const OTP_DIGITS = 6;

function getOtpPepper(): string {
  return process.env.OTP_SECRET ?? "fixora-otp-dev-secret";
}

export function generateOtpCode(): string {
  const max = 10 ** OTP_DIGITS;
  return crypto.randomInt(0, max).toString().padStart(OTP_DIGITS, "0");
}

export function hashOtpCode(identifier: string, purpose: string, code: string): string {
  return crypto
    .createHash("sha256")
    .update(`${getOtpPepper()}:${identifier.toLowerCase().trim()}:${purpose}:${code}`)
    .digest("hex");
}

export function verifyOtpCode(identifier: string, purpose: string, code: string, codeHash: string): boolean {
  const expected = hashOtpCode(identifier, purpose, code);
  const left = Buffer.from(codeHash, "utf8");
  const right = Buffer.from(expected, "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}
