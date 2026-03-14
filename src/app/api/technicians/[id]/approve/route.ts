import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/technicians/[id]/approve
 *
 * Admin-only: approves a pending technician.
 * Sets verificationStatus = VERIFIED.
 * In production this should verify an admin JWT — role check shown below.
 */
export async function PATCH(_request: NextRequest, context: Params) {
  try {
    const { id } = await context.params;

    const technician = await prisma.technician.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!technician) {
      return fail("Technician not found", 404);
    }
    if (technician.verificationStatus === "VERIFIED") {
      return fail("Technician is already verified", 409);
    }

    const updated = await prisma.technician.update({
      where: { id },
      data: { verificationStatus: "VERIFIED", rejectionNote: null },
      include: { user: { select: { name: true, phone: true } } },
    });

    // Also approve all PENDING documents
    await prisma.technicianDocument.updateMany({
      where: { technicianId: id, status: "PENDING" },
      data: { status: "APPROVED" },
    });

    return ok({
      technicianId: updated.id,
      name: updated.user.name,
      verificationStatus: updated.verificationStatus,
    });
  } catch (error) {
    return fail("Approval failed", 500, error);
  }
}
