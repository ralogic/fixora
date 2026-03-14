import { getSessionUser } from "@/lib/auth/session";

export type AppRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireRole(allowedRoles: AppRole | AppRole[]) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    throw new AuthorizationError("Authentication required", 401);
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(sessionUser.role as AppRole)) {
    throw new AuthorizationError("You do not have access to this resource", 403);
  }

  return sessionUser;
}
