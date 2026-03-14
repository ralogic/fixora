export function getPrismaConnectivityMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return null;
  }

  if (error.name === "PrismaClientInitializationError") {
    return "Database unavailable. Check your Supabase/Postgres connection and DATABASE_URL.";
  }

  if (error.message.includes("Can't reach database server")) {
    return "Database unavailable. Check your Supabase/Postgres connection and DATABASE_URL.";
  }

  return null;
}
