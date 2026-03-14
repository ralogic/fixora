import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils/response";
import { getPendingTechnicianApplications } from "@/server/modules/admin/verifications";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

/**
 * GET /api/technicians/pending
 *
 * Admin: returns all technicians with verificationStatus = PENDING,
 * sorted by registration date (newest first).
 */
export async function GET(_request: NextRequest) {
  try {
    await requireRole("ADMIN");
    const technicians = await getPendingTechnicianApplications();

    return ok({ technicians, total: technicians.length });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Failed to fetch pending technicians", 500, error);
  }
}
