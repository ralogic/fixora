import { prisma } from "@/lib/prisma/client";

export async function writeAuditLog(input: {
  actorUserId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      detailsJson: input.details,
    },
  });
}
