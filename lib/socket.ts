// Shared Socket.IO client singleton for authenticated member realtime events.
import { io, type Socket } from "socket.io-client";
import { API_URL } from "./api";

let socketInstance: Socket | null = null;

// Returns the shared Socket.IO client configured with credentials for cookie auth.
export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(API_URL || undefined, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
}

// Disconnects and clears the shared socket (used on logout so rooms never leak across accounts).
export function disconnectSocket(): void {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
}
