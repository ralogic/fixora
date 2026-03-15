let prismaBackoffUntil = 0;

export function getPrismaConnectivityMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return null;
  }

  const message = error.message.toLowerCase();

  if (error.name === "PrismaClientInitializationError") {
    return "Database unavailable. Check your Supabase/Postgres connection and DATABASE_URL.";
  }

  if (error.message.includes("Can't reach database server")) {
    return "Database unavailable. Check your Supabase/Postgres connection and DATABASE_URL.";
  }

  if (
    message.includes("timed out fetching a new connection from the connection pool") ||
    message.includes("connection pool timeout") ||
    message.includes("connectionreset") ||
    message.includes("forcibly closed by the remote host")
  ) {
    return "Database is busy right now. Please retry in a few seconds.";
  }

  return null;
}

export function isPrismaTemporarilyUnavailable() {
  return Date.now() < prismaBackoffUntil;
}

export function markPrismaTemporarilyUnavailable(backoffMs = 15000) {
  prismaBackoffUntil = Date.now() + backoffMs;
}

export class PrismaFastFailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrismaFastFailError";
  }
}

export async function withPrismaFailFast<T>(
  operation: () => Promise<T>,
  options?: { timeoutMs?: number; backoffMs?: number },
) {
  if (isPrismaTemporarilyUnavailable()) {
    throw new PrismaFastFailError("Database temporarily unavailable");
  }

  const timeoutMs = options?.timeoutMs ?? 2500;
  const backoffMs = options?.backoffMs ?? 15000;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new PrismaFastFailError("Database request timeout")), timeoutMs);
    });

    return await Promise.race([operation(), timeoutPromise]);
  } catch (error) {
    if (error instanceof PrismaFastFailError || getPrismaConnectivityMessage(error)) {
      markPrismaTemporarilyUnavailable(backoffMs);
    }

    throw error;
  }
}
