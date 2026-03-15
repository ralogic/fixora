import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { fail, ok } from "@/lib/utils/response";
import { z } from "zod";

const schema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive(),
  method: z.string().min(2),
  status: z.enum(["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"]).default("SUCCEEDED"),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return fail("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid request", 400, parsed.error.flatten());

  const booking = await prisma.booking.findUnique({ where: { id: parsed.data.bookingId } });
  if (!booking) return fail("Booking not found", 404);
  if (booking.customerId !== session.sub && session.role !== "ADMIN") return fail("Forbidden", 403);

  const payment = await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      status: parsed.data.status,
    },
    update: {
      amount: parsed.data.amount,
      method: parsed.data.method,
      status: parsed.data.status,
    },
  });

  return ok(payment);
}
