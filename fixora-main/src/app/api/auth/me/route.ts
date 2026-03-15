import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { fail, ok } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return fail("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, role: true, createdAt: true, isSuspended: true },
  });

  if (!user) return fail("User not found", 404);
  return ok(user);
}
