import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils/response";
import {
  rejectTechnicianApplication,
  TechnicianVerificationError,
} from "@/server/modules/admin/verifications";

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
    const updated = await rejectTechnicianApplication(id, reason);

    return ok({
      technicianId: updated.id,
      name: updated.user.name,
      verificationStatus: updated.verificationStatus,
      rejectionNote: updated.rejectionNote,
    });
  } catch (error) {
    if (error instanceof TechnicianVerificationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Rejection failed", 500, error);
  }
}
