import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/response";

const schema = z.object({
  technicianId: z.string().min(1),
  verified: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const auth = requireRole(session, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid request", 400, parsed.error.flatten());

  const technician = await prisma.technician.update({
    where: { id: parsed.data.technicianId },
    data: { verified: parsed.data.verified },
  });

  return ok(technician);
}
