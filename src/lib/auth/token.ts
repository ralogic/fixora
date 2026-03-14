import crypto from "crypto";

type TokenPayload = {
  userId: string;
  role: string;
  phone: string;
  exp: number;
};

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getSecret(): string {
  return process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "fixora-dev-secret";
}

export function signAuthToken(payload: Omit<TokenPayload, "exp">, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const data: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(data));
  const signature = crypto.createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string): TokenPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);

  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as TokenPayload;
    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
