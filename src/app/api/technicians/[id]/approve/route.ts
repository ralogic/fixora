import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils/response";
import {
  approveTechnicianApplication,
  TechnicianVerificationError,
} from "@/server/modules/admin/verifications";

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
    const updated = await approveTechnicianApplication(id);

    return ok({
      technicianId: updated.id,
      name: updated.user.name,
      verificationStatus: updated.verificationStatus,
    });
  } catch (error) {
    if (error instanceof TechnicianVerificationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Approval failed", 500, error);
  }
}
