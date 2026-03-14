/**
 * Fixora standalone Socket.io realtime gateway
 * Run: node scripts/socket-server.mjs  (or ts-node scripts/socket-server.ts)
 *
 * Channels:
 *   order:{orderId}       – customer & admin listeners
 *   technician:{id}       – technician device
 *   city_ops:{cityId}     – admin operations board
 *
 * Events emitted TO client:
 *   order:status          – { orderId, status }
 *   technician:location   – { technicianId, lat, lng }
 *   dispatch:offer        – { orderId, serviceId, etaMinutes }
 *   payment:result        – { orderId, status }
 *
 * Events received FROM client:
 *   room:join             – { room }
 *   room:leave            – { room }
 *   location:update       – { technicianId, lat, lng, seq }
 *   order:accept          – { orderId, technicianId }
 *   order:status          – { orderId, status, technicianId }
 */

import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 4000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];
const SOCKET_AUTH_TOKEN = process.env.SOCKET_AUTH_TOKEN ?? "";

function isSocketAuthorized(socket) {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!SOCKET_AUTH_TOKEN) {
    return false;
  }

  const provided = socket.handshake.auth?.token ?? socket.handshake.query?.token;
  return typeof provided === "string" && provided === SOCKET_AUTH_TOKEN;
}

function isRoomAllowed(room) {
  return (
    typeof room === "string" &&
    (room.startsWith("order:") || room.startsWith("technician:") || room.startsWith("city_ops:"))
  );
}

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Fixora Socket Gateway");
});

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  if (!isSocketAuthorized(socket)) {
    console.warn(`[Socket] Unauthorized connection attempt: ${socket.id}`);
    socket.disconnect(true);
    return;
  }

  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on("room:join", (room) => {
    if (!isRoomAllowed(room)) {
      console.warn(`[Socket] Rejected room join for ${socket.id}: ${room}`);
      return;
    }

    void socket.join(room);
    console.log(`[Socket] ${socket.id} joined ${room}`);
  });

  socket.on("room:leave", (room) => {
    if (!isRoomAllowed(room)) {
      return;
    }

    void socket.leave(room);
    console.log(`[Socket] ${socket.id} left ${room}`);
  });

  socket.on("location:update", (payload) => {
    const { technicianId, lat, lng, seq } = payload;
    if (!technicianId || typeof lat !== "number" || typeof lng !== "number") return;

    io.to(`technician:${technicianId}`).emit("technician:location", { technicianId, lat, lng, seq });

    // Broadcast to any order room containing this technician
    // In production, resolve active orderId from Redis and broadcast:
    // io.to(`order:${activeOrderId}`).emit("technician:location", { lat, lng, seq });
    console.log(`[Dispatch] Tech ${technicianId} at ${lat},${lng}`);
  });

  socket.on("order:accept", ({ orderId, technicianId }) => {
    io.to(`order:${orderId}`).emit("order:status", { orderId, status: "ASSIGNED" });
    io.to("city_ops:jaipur").emit("order:status", { orderId, status: "ASSIGNED", technicianId });
    console.log(`[Dispatch] Order ${orderId} accepted by tech ${technicianId}`);
  });

  socket.on("order:status", ({ orderId, status }) => {
    io.to(`order:${orderId}`).emit("order:status", { orderId, status });
    io.to("city_ops:jaipur").emit("order:status", { orderId, status });
  });

  socket.on("disconnect", (reason) => {
    console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Fixora Socket Gateway running on port ${PORT}`);
});
