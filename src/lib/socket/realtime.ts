type EmitPayload = {
  room: string;
  event: string;
  payload: Record<string, unknown>;
};

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL ?? process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
const SOCKET_EMIT_TOKEN = process.env.SOCKET_EMIT_TOKEN ?? process.env.SOCKET_AUTH_TOKEN ?? "";

async function postRealtimeEvent(input: EmitPayload) {
  if (!SOCKET_SERVER_URL || !SOCKET_EMIT_TOKEN) {
    // Keep the API flow successful even when realtime service is unavailable.
    return;
  }

  try {
    const response = await fetch(`${SOCKET_SERVER_URL}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-socket-emit-token": SOCKET_EMIT_TOKEN,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[Realtime] Emit failed", {
        status: response.status,
        room: input.room,
        event: input.event,
      });
    }
  } catch (error) {
    console.warn("[Realtime] Emit error", {
      room: input.room,
      event: input.event,
      error,
    });
  }
}

export async function emitOrderStatusUpdate(input: {
  orderId: string;
  status: string;
  cityId?: string | null;
  technicianId?: string | null;
}) {
  const basePayload: Record<string, unknown> = {
    orderId: input.orderId,
    status: input.status,
  };

  if (input.technicianId) {
    basePayload.technicianId = input.technicianId;
  }

  await postRealtimeEvent({
    room: `order:${input.orderId}`,
    event: "order:status",
    payload: basePayload,
  });

  if (input.cityId) {
    await postRealtimeEvent({
      room: `city_ops:${input.cityId}`,
      event: "order:status",
      payload: basePayload,
    });
  }
}

export async function emitDispatchOffer(input: {
  orderId: string;
  technicianId: string;
  serviceId: string;
  cityId?: string | null;
  etaMinutes?: number | null;
}) {
  const payload: Record<string, unknown> = {
    orderId: input.orderId,
    serviceId: input.serviceId,
  };

  if (typeof input.etaMinutes === "number") {
    payload.etaMinutes = input.etaMinutes;
  }

  await postRealtimeEvent({
    room: `technician:${input.technicianId}`,
    event: "dispatch:offer",
    payload,
  });

  if (input.cityId) {
    await postRealtimeEvent({
      room: `city_ops:${input.cityId}`,
      event: "dispatch:offer",
      payload: {
        ...payload,
        technicianId: input.technicianId,
      },
    });
  }
}

export async function emitPaymentResult(input: {
  orderId: string;
  status: string;
  cityId?: string | null;
}) {
  const payload = {
    orderId: input.orderId,
    status: input.status,
  };

  await postRealtimeEvent({
    room: `order:${input.orderId}`,
    event: "payment:result",
    payload,
  });

  if (input.cityId) {
    await postRealtimeEvent({
      room: `city_ops:${input.cityId}`,
      event: "payment:result",
      payload,
    });
  }
}

export async function emitTechnicianLocationUpdate(input: {
  technicianId: string;
  lat: number;
  lng: number;
  orderId?: string | null;
  cityId?: string | null;
}) {
  const payload: Record<string, unknown> = {
    technicianId: input.technicianId,
    lat: input.lat,
    lng: input.lng,
  };

  await postRealtimeEvent({
    room: `technician:${input.technicianId}`,
    event: "technician:location",
    payload,
  });

  if (input.orderId) {
    await postRealtimeEvent({
      room: `order:${input.orderId}`,
      event: "technician:location",
      payload,
    });
  }

  if (input.cityId) {
    await postRealtimeEvent({
      room: `city_ops:${input.cityId}`,
      event: "technician:location",
      payload: {
        ...payload,
        orderId: input.orderId ?? null,
      },
    });
  }
}
