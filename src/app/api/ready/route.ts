import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";

export async function GET() {
  const checks: Record<string, { ok: boolean; message?: string }> = {
    database: { ok: false },
    socket: { ok: false },
    redis: { ok: false, message: "REDIS_URL not configured" },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true };
  } catch (error) {
    checks.database = {
      ok: false,
      message: error instanceof Error ? error.message : "Database check failed",
    };
  }

  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    checks.socket = { ok: true };
  } else {
    checks.socket = { ok: false, message: "NEXT_PUBLIC_SOCKET_URL is not configured" };
  }

  if (process.env.REDIS_URL) {
    checks.redis = { ok: true };
  }

  const allReady = Object.values(checks).every((check) => check.ok);

  if (!allReady) {
    return fail("Service is not ready", 503, { checks });
  }

  return ok({ status: "ready", checks });
}
