import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { technicianOnboardSchema } from "@/lib/validation/technician";
import { fail, ok } from "@/lib/utils/response";
import { hashPassword } from "@/lib/auth/password";
import { sanitizeString } from "@/lib/utils/sanitize";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = technicianOnboardSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request", 400, parsed.error.flatten());

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return fail("Email already in use", 409);

  const user = await prisma.user.create({
    data: {
      name: sanitizeString(parsed.data.name),
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      role: "TECHNICIAN",
    },
  });

  const technician = await prisma.technician.create({
    data: {
      userId: user.id,
      category: sanitizeString(parsed.data.category),
      experience: parsed.data.experience,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      idProofUrl: parsed.data.idProofUrl,
      profilePhotoUrl: parsed.data.profilePhotoUrl,
      verified: false,
    },
  });

  return ok({ user, technician }, 201);
}
