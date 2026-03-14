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
