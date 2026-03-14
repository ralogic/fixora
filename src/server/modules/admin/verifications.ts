import { prisma } from "@/lib/prisma/client";

export class TechnicianVerificationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "TechnicianVerificationError";
  }
}

export async function getPendingTechnicianApplications() {
  return prisma.technician.findMany({
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
}

export async function approveTechnicianApplication(id: string) {
  const technician = await prisma.technician.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!technician) {
    throw new TechnicianVerificationError("Technician not found", 404);
  }

  if (technician.verificationStatus === "VERIFIED") {
    throw new TechnicianVerificationError("Technician is already verified", 409);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.technician.update({
      where: { id },
      data: { verificationStatus: "VERIFIED", rejectionNote: null },
      include: { user: { select: { name: true, phone: true } } },
    });

    await tx.technicianDocument.updateMany({
      where: { technicianId: id, status: "PENDING" },
      data: { status: "APPROVED", rejectionNote: null },
    });

    return updated;
  });
}

export async function rejectTechnicianApplication(id: string, reason: string | null) {
  const technician = await prisma.technician.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!technician) {
    throw new TechnicianVerificationError("Technician not found", 404);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.technician.update({
      where: { id },
      data: { verificationStatus: "REJECTED", rejectionNote: reason },
      include: { user: { select: { name: true, phone: true } } },
    });

    await tx.technicianDocument.updateMany({
      where: { technicianId: id, status: "PENDING" },
      data: { status: "REJECTED", rejectionNote: reason },
    });

    return updated;
  });
}
