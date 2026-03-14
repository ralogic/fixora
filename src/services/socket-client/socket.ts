import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    const authToken = process.env.NEXT_PUBLIC_SOCKET_AUTH_TOKEN;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
      autoConnect: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      ...(authToken ? { auth: { token: authToken } } : {}),
    });
  }

  return socket;
}
