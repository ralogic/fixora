type RateLimitConfig = {
  action: string;
  key: string;
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(config: RateLimitConfig): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const bucketKey = `${config.action}:${config.key}`;
  const existing = buckets.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, retryAfterSeconds: Math.ceil(config.windowMs / 1000) };
  }

  if (existing.count >= config.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  buckets.set(bucketKey, existing);

  return {
    allowed: true,
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

export function getRateLimitKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
