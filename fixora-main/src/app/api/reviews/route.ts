import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { fail, ok } from "@/lib/utils/response";

const schema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(2).max(500),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return fail("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid request", 400, parsed.error.flatten());

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { technician: true },
  });
  if (!booking) return fail("Booking not found", 404);
  if (booking.customerId !== session.sub) return fail("Forbidden", 403);
  if (booking.status !== "COMPLETED") return fail("Review allowed after completion only", 400);

  const review = await prisma.review.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment.trim(),
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment.trim(),
    },
  });

  const aggregate = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { id: true },
    where: { booking: { technicianId: booking.technicianId } },
  });

  await prisma.technician.update({
    where: { id: booking.technicianId },
    data: {
      rating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count.id,
    },
  });

  return ok(review, 201);
}
