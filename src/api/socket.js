import { io } from "socket.io-client";
import { getToken } from "./api";

// The socket server is the same server as the API, just without "/api" at the end
const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

// Creates a new connection. The token is read again on every reconnect
export function createSocket() {
  return io(SOCKET_URL, {
    auth: (callback) => callback({ token: getToken() }),
  });
}