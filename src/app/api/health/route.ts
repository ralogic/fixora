import { ok } from "@/lib/utils/response";

export async function GET() {
  return ok({
    status: "ok",
    service: "fixora-web",
    timestamp: new Date().toISOString(),
  });
}
