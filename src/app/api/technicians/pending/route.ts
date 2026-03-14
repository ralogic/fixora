import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils/response";
import { getPendingTechnicianApplications } from "@/server/modules/admin/verifications";

/**
 * GET /api/technicians/pending
 *
 * Admin: returns all technicians with verificationStatus = PENDING,
 * sorted by registration date (newest first).
 */
export async function GET(_request: NextRequest) {
  try {
    const technicians = await getPendingTechnicianApplications();

    return ok({ technicians, total: technicians.length });
  } catch (error) {
    return fail("Failed to fetch pending technicians", 500, error);
  }
}
