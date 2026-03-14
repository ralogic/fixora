import { prisma } from "@/lib/prisma/client";

export async function createNotification(input: {
  userId: string;
  type: string;
  message: string;
  payload?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      payloadJson: input.payload,
      status: "UNREAD",
    },
  });
}
