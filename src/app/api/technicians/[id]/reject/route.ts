import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/technicians/[id]/reject
 *
 * Admin-only: rejects a pending technician with an optional reason.
 * Body: { reason?: string }
 */
export async function PATCH(request: NextRequest, context: Params) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = (body?.reason as string | undefined) ?? null;

    const technician = await prisma.technician.findUnique({ where: { id } });
    if (!technician) {
      return fail("Technician not found", 404);
    }

    const updated = await prisma.technician.update({
      where: { id },
      data: { verificationStatus: "REJECTED", rejectionNote: reason },
      include: { user: { select: { name: true, phone: true } } },
    });

    return ok({
      technicianId: updated.id,
      name: updated.user.name,
      verificationStatus: updated.verificationStatus,
      rejectionNote: updated.rejectionNote,
    });
  } catch (error) {
    return fail("Rejection failed", 500, error);
  }
}
