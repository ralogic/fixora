import { getActiveUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/utils/response";

export async function GET() {
  try {
    const user = await getActiveUser();

    return ok({ user });
  } catch (error) {
    return fail("Unable to fetch session", 500, error);
  }
}
