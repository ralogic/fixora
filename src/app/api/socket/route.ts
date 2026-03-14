import { ok } from "@/lib/utils/response";

// In production, run Socket.io gateway as a dedicated Node process.
// This endpoint documents realtime capability and can expose socket metadata.
export async function GET() {
  return ok({
    namespace: "fixora-realtime",
    channels: ["order:{orderId}", "technician:{technicianId}", "city_ops:{cityId}"],
    transport: ["websocket", "polling"],
  });
}
