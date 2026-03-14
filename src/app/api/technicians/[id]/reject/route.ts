import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils/response";
import {
  rejectTechnicianApplication,
  TechnicianVerificationError,
} from "@/server/modules/admin/verifications";
import { AuthorizationError, requireRole } from "@/server/shared/authz";
import { writeAuditLog } from "@/server/modules/admin/audit";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/technicians/[id]/reject
 *
 * Admin-only: rejects a pending technician with an optional reason.
 * Body: { reason?: string }
 */
export async function PATCH(request: NextRequest, context: Params) {
  try {
    const admin = await requireRole("ADMIN");
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = (body?.reason as string | undefined) ?? null;
    const updated = await rejectTechnicianApplication(id, reason);

    await writeAuditLog({
      actorUserId: admin.id,
      action: "TECHNICIAN_REJECTED",
      resource: "technician",
      resourceId: id,
      details: { reason },
    });

    return ok({
      technicianId: updated.id,
      name: updated.user.name,
      verificationStatus: updated.verificationStatus,
      rejectionNote: updated.rejectionNote,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    if (error instanceof TechnicianVerificationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Rejection failed", 500, error);
  }
}
