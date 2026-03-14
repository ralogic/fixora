import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export async function createNotification(input: {
  userId: string;
  type: string;
  message: string;
  payload?: Record<string, unknown>;
}) {
  const safePayload = input.payload
    ? (JSON.parse(JSON.stringify(input.payload)) as Prisma.InputJsonValue)
    : undefined;

  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      payloadJson: safePayload,
      status: "UNREAD",
    },
  });
}
