import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/rbac";
import { bookingCreateSchema } from "@/lib/validation/booking";
import { fail, ok } from "@/lib/utils/response";
import { sanitizeString } from "@/lib/utils/sanitize";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return fail("Unauthorized", 401);

  if (session.role === "CUSTOMER") {
    const bookings = await prisma.booking.findMany({ where: { customerId: session.sub }, orderBy: { createdAt: "desc" } });
    return ok(bookings);
  }

  if (session.role === "TECHNICIAN") {
    const technician = await prisma.technician.findUnique({ where: { userId: session.sub } });
    if (!technician) return fail("Technician profile missing", 404);
    const bookings = await prisma.booking.findMany({ where: { technicianId: technician.id }, orderBy: { createdAt: "desc" } });
    return ok(bookings);
  }

  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return ok(bookings);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const auth = requireRole(session, ["CUSTOMER", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = bookingCreateSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid booking data", 400, parsed.error.flatten());

  const technician = await prisma.technician.findUnique({ where: { id: parsed.data.technicianId } });
  if (!technician || !technician.verified) return fail("Technician unavailable", 400);

  const booking = await prisma.booking.create({
    data: {
      customerId: session!.sub,
      technicianId: parsed.data.technicianId,
      service: sanitizeString(parsed.data.service),
      date: new Date(parsed.data.date),
      price: parsed.data.price,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      addressLine: sanitizeString(parsed.data.addressLine),
      status: "PENDING",
    },
  });

  await prisma.notification.create({
    data: {
      userId: technician.userId,
      bookingId: booking.id,
      title: "New booking request",
      body: `New ${booking.service} request assigned for review.`,
    },
  });

  return ok(booking, 201);
}
