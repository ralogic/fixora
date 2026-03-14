import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export async function writeAuditLog(input: {
  actorUserId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}) {
  const safeDetails = input.details
    ? (JSON.parse(JSON.stringify(input.details)) as Prisma.InputJsonValue)
    : undefined;

  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      detailsJson: safeDetails,
    },
  });
}
