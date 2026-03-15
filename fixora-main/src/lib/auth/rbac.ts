import { fail } from "@/lib/utils/response";
import type { SessionPayload } from "@/lib/auth/jwt";

export function requireRole(session: SessionPayload | null, roles: SessionPayload["role"][]) {
  if (!session) {
    return { ok: false as const, response: fail("Unauthorized", 401) };
  }

  if (!roles.includes(session.role)) {
    return { ok: false as const, response: fail("Forbidden", 403) };
  }

  return { ok: true as const };
}
