import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { fail, ok } from "@/lib/utils/response";

const createSchema = z.object({
  bookingId: z.string().min(1),
  receiverId: z.string().min(1),
  message: z.string().min(1).max(1000),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return fail("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) return fail("bookingId is required", 400);

  const booking = await prisma.booking.findUnique({ include: { technician: true }, where: { id: bookingId } });
  if (!booking) return fail("Booking not found", 404);

  const allowed =
    booking.customerId === session.sub || booking.technician.userId === session.sub || session.role === "ADMIN";
  if (!allowed) return fail("Forbidden", 403);

  const messages = await prisma.message.findMany({ where: { bookingId }, orderBy: { timestamp: "asc" } });
  return ok(messages);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return fail("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request", 400, parsed.error.flatten());

  const booking = await prisma.booking.findUnique({ include: { technician: true }, where: { id: parsed.data.bookingId } });
  if (!booking) return fail("Booking not found", 404);

  const allowed =
    booking.customerId === session.sub || booking.technician.userId === session.sub || session.role === "ADMIN";
  if (!allowed) return fail("Forbidden", 403);

  const message = await prisma.message.create({
    data: {
      bookingId: parsed.data.bookingId,
      senderId: session.sub,
      receiverId: parsed.data.receiverId,
      message: parsed.data.message.trim(),
    },
  });

  return ok(message, 201);
}
