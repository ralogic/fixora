import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils/response";
import { bookServiceSchema } from "@/lib/validation/booking";
import { BookingCreationError, createBooking } from "@/server/modules/bookings/create-booking";
import { getActiveUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookServiceSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid booking payload", 422, parsed.error.flatten());
    }

    const user = await getActiveUser();
    if (!user.email) {
      return fail("Please verify your email to continue booking", 403);
    }

    const result = await createBooking({
      ...parsed.data,
      customerId: user.id,
    });
    return ok(result);
  } catch (error) {
    if (error instanceof BookingCreationError) {
      return fail(error.message, error.statusCode, error.details);
    }

    return fail("Unable to create booking", 500, error);
  }
}
