import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";

/**
 * GET /api/technicians/pending
 *
 * Admin: returns all technicians with verificationStatus = PENDING,
 * sorted by registration date (newest first).
 */
export async function GET(_request: NextRequest) {
  try {
    const technicians = await prisma.technician.findMany({
      where: { verificationStatus: "PENDING" },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, createdAt: true, city: true },
        },
        documents: true,
        bankDetails: { select: { bankName: true, accountName: true } },
        serviceMappings: {
          include: { service: { select: { name: true, category: true } } },
        },
      },
      orderBy: { user: { createdAt: "desc" } },
    });

    return ok({ technicians, total: technicians.length });
  } catch (error) {
    return fail("Failed to fetch pending technicians", 500, error);
  }
}
