import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { bookingStatusSchema } from "@/lib/validation/booking";
import { fail, ok } from "@/lib/utils/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return fail("Unauthorized", 401);

  const { bookingId } = await params;
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { technician: true } });
  if (!booking) return fail("Booking not found", 404);

  if (session.role === "CUSTOMER" && booking.customerId !== session.sub) return fail("Forbidden", 403);
  if (session.role === "TECHNICIAN" && booking.technician.userId !== session.sub) return fail("Forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = bookingStatusSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid status", 400, parsed.error.flatten());

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: parsed.data.status },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: booking.customerId,
        bookingId: booking.id,
        title: "Booking status updated",
        body: `Booking is now ${parsed.data.status}`,
      },
      {
        userId: booking.technician.userId,
        bookingId: booking.id,
        title: "Booking status updated",
        body: `Booking is now ${parsed.data.status}`,
      },
    ],
  });

  return ok(updated);
}
